"""
DiskHub Portal — Backend vollständig (Phase 1 + Phase 2)

Phase 1 (bestehend):
- GET /api/diskhub/list?search= — Liste aller Diskussionen
- GET /api/diskhub/<id> — Einzelne Diskussion lesen
- GET /api/diskhub/health — Health-Check

Phase 2 (Discord-Integration):
- POST /api/diskhub/start-session — Discord-Webhook-Trigger (3 Calls)
- GET /api/diskhub/session-status — Session via state.db suchen (title LIKE disc-%)
- GET /api/diskhub/session-messages/<session_id> — Nachrichten einer Session
- POST /api/diskhub/adopt-block — "In Dokument übernehmen" via hermes CLI
- POST /api/diskhub/generate-summary — "Von Hermi generieren"
- POST /api/diskhub/suggest-readme — README-Vergleich via hermes CLI
- POST /api/diskhub/update-readme — Neue README schreiben + git commit
- POST /api/diskhub/start-sub-discussion — Sub-Diskussion starten (3er-Webhook)
"""

import json
import os
import re
import subprocess
import sqlite3
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, Response as FlaskResponse, send_from_directory

diskhub = Blueprint('diskhub', __name__)

# ── Pfade ──────────────────────────────────────────────────────────────────────

REPO_DIR = os.path.expanduser('~/repos/butler-portal-diskhub')
DISCUSSIONS_DIR = os.path.join(REPO_DIR, 'discussions')
ACTIVITY_LOG = os.path.expanduser('~/data/portal-logs/diskhub.json')
STATE_DB = os.path.expanduser('~/.hermes/state.db')

# ── Hardcodierte Webhook-Konfiguration ────────────────────────────────────────
# Schlüsselmeister ist defekt — Werte direkt hier statt via config.yaml
WEBHOOK_URL = "https://discord.com/api/webhooks/1505338792972910642/HGtaG2ettwRaiInpHIpJpHermS4YXCLWfTzfdlyoHCOEbjmTULywq5WC0GCJ0NERUpnx"
BOT_MENTION = "<@1467915427077423216>"
CHANNEL_ID = "1505338710491926560"


def init_diskhub(data_dir=None):
    """Portal-Loader-kompatible Init."""
    os.makedirs(DISCUSSIONS_DIR, exist_ok=True)


# ── Aktivitäts-Logging ─────────────────────────────────────────────────────────

def _log_activity(action, details=None):
    """Activity-Logging (Portal-Standard, FIFO max 200)."""
    try:
        os.makedirs(os.path.dirname(ACTIVITY_LOG), exist_ok=True)
        entries = []
        if os.path.exists(ACTIVITY_LOG):
            try:
                with open(ACTIVITY_LOG) as f:
                    entries = json.load(f)
            except Exception:
                entries = []
        entries.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': action,
            'details': details or {},
        })
        entries = entries[-200:]
        with open(ACTIVITY_LOG, 'w') as f:
            json.dump(entries, f, indent=2)
    except Exception as e:
        print(f"[DISKHUB] Activity log write failed: {e}")


def _git_push():
    """Push commits to remote. Silent failure — nicht kritisch wenn Push fehlschlägt."""
    try:
        subprocess.run(
            ['git', 'push'],
            capture_output=True, text=True, timeout=30, cwd=REPO_DIR
        )
    except Exception as e:
        print(f"[DISKHUB] Git push failed (non-critical): {e}")


# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def _parse_readme_status(readme_path):
    """Liest README.md und extrahiert Status-Infos."""
    status = {'erledigt': 0, 'offen': 0, 'summary': '', 'question': ''}
    if not os.path.isfile(readme_path):
        return status
    try:
        with open(readme_path, 'r') as f:
            content = f.read()
        status['summary'] = content[:200].strip()
        # Zähle explizite Status-Angaben
        done_nums = re.findall(r'(\d+)\s*erledigt', content.lower())
        open_nums = re.findall(r'(\d+)\s*offen', content.lower())
        if done_nums:
            status['erledigt'] = max(int(n) for n in done_nums)
        if open_nums:
            status['offen'] = max(int(n) for n in open_nums)
        if not done_nums:
            status['erledigt'] = content.count('✅')
        if not open_nums:
            status['offen'] = content.count('●')
        # Frage finden (erste H1)
        for line in content.split('\n'):
            if line.startswith('# ') and 'aktueller stand' not in line.lower():
                status['question'] = line.replace('# ', '').strip()
                break
    except Exception:
        pass
    return status


def _parse_index_status(index_content):
    """Zählt erledigt/offen aus index.md (### #XX: Title (✓ erledigt)).

    Parst dynamisch den aktuellen Inhalt — zählt ### #XX:-Einträge für
    Gesamtzahl und (✓ erledigt)-Marker für erledigte Items.
    """
    result = {'erledigt': 0, 'offen': 0, 'summary': '', 'question': ''}
    if not index_content:
        return result
    # Alle ### #XX: Einträge
    items = re.findall(r'^### #(\d+):', index_content, re.MULTILINE)
    # Davon mit ✓ erledigt
    done = re.findall(r'^### #\d+:.*\(✓ erledigt\)', index_content, re.MULTILINE)
    result['erledigt'] = len(done)
    result['offen'] = len(items) - len(done)
    return result


def _scan_discussions():
    """Scannt discussions/-Ordner und gibt sortierte Liste zurück."""
    entries = []
    if not os.path.isdir(DISCUSSIONS_DIR):
        return entries

    for name in sorted(os.listdir(DISCUSSIONS_DIR)):
        folder = os.path.join(DISCUSSIONS_DIR, name)
        if not os.path.isdir(folder) or name.startswith('.'):
            continue

        readme_path = os.path.join(folder, 'README.md')
        index_path = os.path.join(folder, 'index.md')

        # Letzte Änderung (git log)
        last_modified = None
        try:
            result = subprocess.run(
                ['git', 'log', '-1', '--format=%ct', '--', '.'],
                capture_output=True, text=True, timeout=5, cwd=folder
            )
            if result.returncode == 0 and result.stdout.strip():
                last_modified = int(result.stdout.strip())
        except Exception:
            pass

        if not last_modified:
            for p in [index_path, readme_path]:
                if os.path.isfile(p):
                    last_modified = int(os.path.getmtime(p))
                    break

        status = _parse_readme_status(readme_path)
        # #20: Dynamischer Status aus index.md für Haupt-Diskussion
        if os.path.isfile(index_path):
            with open(index_path, 'r') as f:
                idx_status = _parse_index_status(f.read())
            if idx_status['erledigt'] + idx_status['offen'] > 0:
                status = idx_status

        # Sub-Diskussionen
        subs = []
        for sub_name in sorted(os.listdir(folder)):
            sub_folder = os.path.join(folder, sub_name)
            if os.path.isdir(sub_folder) and not sub_name.startswith('.') and sub_name != 'assets':
                sub_readme = os.path.join(sub_folder, 'README.md')
                sub_index = os.path.join(sub_folder, 'index.md')
                # #20: Dynamischer Status aus index.md, Fallback auf README
                sub_status = {'erledigt': 0, 'offen': 0, 'summary': '', 'question': ''}
                if os.path.isfile(sub_index):
                    with open(sub_index, 'r') as f:
                        idx_status = _parse_index_status(f.read())
                    if idx_status['erledigt'] + idx_status['offen'] > 0:
                        sub_status = idx_status
                if sub_status['erledigt'] + sub_status['offen'] == 0:
                    sub_status = _parse_readme_status(sub_readme)
                subs.append({
                    'id': sub_name,
                    'name': sub_name.replace('-', ' ').title(),
                    'status': sub_status,
                })

        entries.append({
            'id': name,
            'name': name.replace('-', ' ').title(),
            'has_readme': os.path.isfile(readme_path),
            'has_index': os.path.isfile(index_path),
            'last_modified': last_modified,
            'status': status,
            'subs': subs,
        })

    entries.sort(key=lambda e: e['last_modified'] or 0, reverse=True)
    return entries


def _send_webhook(webhook_url, content, bot_mention=None):
    """Sendet eine Nachricht per Discord-Webhook. Returns HTTP-Status-Code."""
    if bot_mention:
        full_content = f"{bot_mention}\n{content}"
    else:
        full_content = content

    payload = json.dumps({
        'content': full_content,
        'allowed_mentions': {'parse': ['users']},
    }).encode('utf-8')

    req = urllib.request.Request(
        webhook_url,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'curl/8.12.1',  # Discord blockiert manche User-Agents
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except urllib.error.URLError as e:
        return 0


def _query_state_db(search_title=None):
    """Sucht Sessions in state.db, optional nach title LIKE."""
    if not os.path.isfile(STATE_DB):
        return []
    try:
        db = sqlite3.connect(STATE_DB)
        db.row_factory = sqlite3.Row
        c = db.cursor()
        if search_title:
            c.execute(
                "SELECT id, title, source, started_at, ended_at, message_count FROM sessions WHERE title LIKE ? ORDER BY started_at DESC",
                (f'%{search_title}%',)
            )
        else:
            c.execute(
                "SELECT id, title, source, started_at, ended_at, message_count FROM sessions ORDER BY started_at DESC LIMIT 20"
            )
        rows = [dict(r) for r in c.fetchall()]
        db.close()
        return rows
    except sqlite3.Error:
        return []


def _get_session_messages(session_id):
    """Holt Nachrichten einer Session aus state.db."""
    if not os.path.isfile(STATE_DB):
        return []
    try:
        db = sqlite3.connect(STATE_DB)
        db.row_factory = sqlite3.Row
        c = db.cursor()
        c.execute(
            "SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY timestamp",
            (session_id,)
        )
        rows = [dict(r) for r in c.fetchall()]
        db.close()
        return rows
    except sqlite3.Error:
        return []


def _get_session_messages_since(session_id, since_ts):
    """Holt Nachrichten neuer als since_ts (Unix-Timestamp)."""
    if not os.path.isfile(STATE_DB):
        return []
    try:
        db = sqlite3.connect(STATE_DB)
        db.row_factory = sqlite3.Row
        c = db.cursor()
        c.execute(
            "SELECT role, content, timestamp FROM messages WHERE session_id = ? AND timestamp > ? ORDER BY timestamp",
            (session_id, since_ts)
        )
        rows = [dict(r) for r in c.fetchall()]
        db.close()
        return rows
    except sqlite3.Error:
        return []


def _format_timestamp(ts):
    """Unix-Timestamp in lesbares Datum."""
    if not ts:
        return ''
    try:
        dt = datetime.fromtimestamp(float(ts))
        return dt.strftime('%d.%m.%Y %H:%M')
    except (ValueError, TypeError):
        return str(ts)


def _read_file_content(filepath):
    """Liest Datei-Inhalt. Gibt None bei Fehler."""
    if not os.path.isfile(filepath):
        return None
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except Exception:
        return None


def _parse_discussion_header(readme):
    """Extrahiert Header-Infos (Titel, Frage, Datum, Status) aus README.md.
    
    Returns: (header_dict, body_string)
      header_dict = {title, question, created_at, updated_at, done_count, open_count}
      body_string = README ohne Header-Zeilen (ab **Erledigt:** oder ---)
    """
    header = {'title': '', 'question': '', 'created_at': '', 'updated_at': '',
              'done_count': 0, 'open_count': 0}
    if not readme:
        return header, readme
    
    lines = readme.split('\n')
    
    # H1-Titel
    for line in lines:
        if line.startswith('# '):
            header['title'] = line[2:].strip()
            break
    
    # Metadaten (Erstellt, Zuletzt aktualisiert, Status)
    for line in lines[:10]:
        m = re.search(r'\*\*Erstellt:\*\*\s*([^*\n·]+)', line)
        if m:
            header['created_at'] = m.group(1).strip()
        m = re.search(r'\*\*Zuletzt aktualisiert:\*\*\s*([^*\n]+)', line)
        if m:
            header['updated_at'] = m.group(1).strip().rstrip()
        m = re.search(r'\*\*Status:\*\*\s*(\d+)\s*erledigt', line)
        if m:
            header['done_count'] = int(m.group(1))
        m = re.search(r'·\s*(\d+)\s*offen', line)
        if m:
            header['open_count'] = int(m.group(1))
    
    # Frage: erster nicht-leerer Absatz nach der Status-Zeile
    status_idx = -1
    for i, line in enumerate(lines[:15]):
        if '**Status:**' in line:
            status_idx = i
            break
    if status_idx >= 0:
        for i in range(status_idx + 1, len(lines)):
            cleaned = lines[i].strip()
            if cleaned and not cleaned.startswith('**') and not cleaned.startswith('#'):
                para = []
                j = i
                while j < len(lines) and lines[j].strip():
                    para.append(lines[j].strip())
                    j += 1
                header['question'] = ' '.join(para)
                break
    
    # Body: alles ab **Erledigt:** oder **Offen:** oder ---
    body_start = len(lines)
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith('**Erledigt:**') or s.startswith('**Offen:**') or s == '---':
            body_start = i
            break
    
    body = '\n'.join(lines[body_start:]) if body_start < len(lines) else ''
    return header, body


def _parse_hermes_response(raw_output):
    """Extrahiert die eigentliche Hermes-Antwort aus dem CLI-Output.
    
    Der Output enthält: Welcome-Banner → Query → Agent-Init → Hermes-Response-Box → Session-Summary
    Wir extrahieren den Text aus der zweiten Hermes-Box (der Response, nicht dem Welcome-Banner).
    
    Die Response-Box hat das Format: ╭─ ⚕ Hermes ──────────────╮
    Das Welcome-Banner hat:         ╭──────────── Hermes Agent ─╮
    """
    if not raw_output:
        return raw_output
    
    lines = raw_output.split('\n')
    
    # Finde ALLE ╭─ ... Hermes ... Zeilen
    hermes_boxes = []
    for i, line in enumerate(lines):
        if '╭─' in line and ('Hermes' in line or 'hermes' in line.lower()):
            hermes_boxes.append(i)
    
    # Die zweite Box (Index 1) ist die Response-Box, die erste ist der Welcome-Banner
    if len(hermes_boxes) >= 2:
        start_idx = hermes_boxes[1]
        # Suche den Footer (╰─) nach der Response-Box
        for end_idx in range(start_idx + 1, min(start_idx + 100, len(lines))):
            if lines[end_idx].strip().startswith('╰─'):
                response_lines = []
                for line in lines[start_idx + 1:end_idx]:
                    cleaned = line.replace('║', '').replace('│', '').replace('│', '').strip()
                    if cleaned:
                        response_lines.append(cleaned)
                if response_lines:
                    return '\n'.join(response_lines)
                break
    
    # Fallback: Nur eine Box gefunden → das ist vermutlich die Response
    if len(hermes_boxes) == 1:
        start_idx = hermes_boxes[0]
        for end_idx in range(start_idx + 1, min(start_idx + 100, len(lines))):
            if lines[end_idx].strip().startswith('╰─'):
                response_lines = []
                for line in lines[start_idx + 1:end_idx]:
                    cleaned = line.replace('║', '').replace('│', '').replace('│', '').strip()
                    if cleaned:
                        response_lines.append(cleaned)
                if response_lines:
                    return '\n'.join(response_lines)
                break
    
    # Ultima Ratio: Roh-Ausgabe nach dem Welcome-Banner
    if len(lines) > 60:
        cleaned = '\n'.join(lines[55:-5])
        return cleaned.strip()
    
    return raw_output.strip()


def _run_hermes_cli(prompt):
    """Führt hermes chat -q ... --yolo aus und gibt Output zurück."""
    try:
        result = subprocess.run(
            ['hermes', 'chat', '-q', prompt, '--yolo'],
            capture_output=True, text=True, timeout=60,
            cwd=REPO_DIR,
        )
        raw = result.stdout.strip() or result.stderr.strip()
        output = _parse_hermes_response(raw)
        return {'success': result.returncode == 0, 'output': output, 'raw': raw[:1000], 'returncode': result.returncode}
    except subprocess.TimeoutExpired:
        return {'success': False, 'output': 'Timeout nach 60s', 'returncode': -1}
    except FileNotFoundError:
        return {'success': False, 'output': 'hermes CLI nicht gefunden', 'returncode': -1}
    except Exception as e:
        return {'success': False, 'output': str(e), 'returncode': -1}


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1 — Bestehende Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@diskhub.route('/diskhub/list', methods=['GET'])
def list_discussions():
    """Liste aller Diskussionen, sortiert nach letzter Änderung."""
    search = request.args.get('search', '').strip().lower()
    entries = _scan_discussions()

    if search:
        entries = [
            e for e in entries
            if search in e['name'].lower()
            or search in (e['status']['summary'] or '').lower()
        ]

    return jsonify({'discussions': entries, 'total': len(entries)})


@diskhub.route('/diskhub/<discussion_id>', methods=['GET'])
def get_discussion(discussion_id):
    """Einzelne Diskussion mit index.md + README.md Inhalt.
    
    Query-Params:
      sub_path (str, optional) — Sub-Pfad (einzelner Name oder verschachtelt "eltern/sub")
    """
    sub_path = request.args.get('sub_path', '').strip()
    
    if sub_path:
        folder = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_path)
    else:
        folder = os.path.join(DISCUSSIONS_DIR, discussion_id)
        
    if not os.path.isdir(folder):
        return jsonify({'error': 'Diskussion nicht gefunden'}), 404

    result = {'id': discussion_id, 'name': discussion_id.replace('-', ' ').title()}
    if sub_path:
        result['sub_id'] = sub_path
        result['sub_name'] = sub_path.replace('-', ' ').title()

    readme_path = os.path.join(folder, 'README.md')
    if os.path.isfile(readme_path):
        with open(readme_path, 'r') as f:
            readme_content = f.read()
        result['readme'] = readme_content
        header, body = _parse_discussion_header(readme_content)
        # #19: Dynamisches "Zuletzt aktualisiert" aus Git-Log
        # Überschreibt hartcodiertes README-Datum durch tatsächliches Änderungsdatum
        try:
            git_result = subprocess.run(
                ['git', 'log', '-1', '--format=%ct', '--', '.'],
                capture_output=True, text=True, cwd=folder, timeout=5
            )
            if git_result.returncode == 0 and git_result.stdout.strip():
                timestamp = int(git_result.stdout.strip())
                header['updated_at'] = datetime.fromtimestamp(timestamp).strftime('%d.%m.%Y')
        except Exception:
            pass  # Fallback: hartcodiertes README-Datum bleibt erhalten
        result['parsed'] = header
        result['readme_body'] = body

    # Blöcke (#H: Einzeldateien aus blocks/ oder Fallback blocks.md)
    blocks_dir = os.path.join(folder, 'blocks')
    if os.path.isdir(blocks_dir):
        md_files = sorted([f for f in os.listdir(blocks_dir) if f.endswith('.md')])
        blocks_parts = []
        blocks_files = []
        for fname in md_files:
            filepath = os.path.join(blocks_dir, fname)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
            except Exception:
                continue
            blocks_parts.append(content)
            title = ''
            for line in content.split('\n'):
                if line.startswith('### '):
                    title = line[4:].strip()
                    break
            blocks_files.append({'name': fname.replace('.md', ''), 'title': title})
        if blocks_parts:
            result['blocks'] = '\n\n'.join(blocks_parts)
        result['blocks_files'] = blocks_files
    else:
        blocks_path = os.path.join(folder, 'blocks.md')
        if os.path.isfile(blocks_path):
            with open(blocks_path, 'r') as f:
                result['blocks'] = f.read()

    # index/ Ordner (#H) oder Fallback index.md
    index_dir = os.path.join(folder, 'index')
    if os.path.isdir(index_dir):
        md_files = sorted([f for f in os.listdir(index_dir) if f.endswith('.md')])
        index_parts = []
        index_files = []
        for fname in md_files:
            filepath = os.path.join(index_dir, fname)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
            except Exception:
                continue
            index_parts.append(content)
            title = ''
            for line in content.split('\n'):
                if line.startswith('### '):
                    title = line[4:].strip()
                    break
            index_files.append({'name': fname.replace('.md', ''), 'title': title})
        if index_parts:
            result['index'] = '\n\n'.join(index_parts)
        result['index_files'] = index_files
        # #20: Dynamischer Status aus index-Content
        if 'index' in result:
            index_status = _parse_index_status(result['index'])
            if index_status['erledigt'] + index_status['offen'] > 0:
                header['done_count'] = index_status['erledigt']
                header['open_count'] = index_status['offen']
    else:
        index_path = os.path.join(folder, 'index.md')
        if os.path.isfile(index_path):
            with open(index_path, 'r') as f:
                result['index'] = f.read()
            # #20: Dynamischer Status aus index.md statt hartcodiertem README-Wert
            index_status = _parse_index_status(result['index'])
            if index_status['erledigt'] + index_status['offen'] > 0:
                header['done_count'] = index_status['erledigt']
                header['open_count'] = index_status['offen']

    # Sub-Diskussionen (nur bei Haupt-Ansicht oder wenn Sub selbst welche hat)
    subs = []
    for sub_name in sorted(os.listdir(folder)):
        sub_folder = os.path.join(folder, sub_name)
        if os.path.isdir(sub_folder) and not sub_name.startswith('.') and sub_name != 'assets':
            sub_index = os.path.join(sub_folder, 'index.md')
            sub_readme = os.path.join(sub_folder, 'README.md')
            sub_blocks = os.path.join(sub_folder, 'blocks.md')
            sub_data = {'id': sub_name, 'name': sub_name.replace('-', ' ').title()}
            if os.path.isfile(sub_index):
                with open(sub_index, 'r') as f:
                    sub_data['index'] = f.read()
            if os.path.isfile(sub_readme):
                with open(sub_readme, 'r') as f:
                    sub_data['readme'] = f.read()
            if os.path.isfile(sub_blocks):
                with open(sub_blocks, 'r') as f:
                    sub_data['blocks'] = f.read()
            # #20: Dynamischer Status aus Sub-index.md
            sub_data['status'] = _parse_index_status(sub_data.get('index', ''))
            subs.append(sub_data)
    result['subs'] = subs

    _log_activity('view', {'discussion': discussion_id, 'sub_id': sub_path or None})
    return jsonify(result)


@diskhub.route('/diskhub/health', methods=['GET'])
def health():
    """Health-Check."""
    return jsonify({'status': 'ok', 'discussions_count': len(_scan_discussions())})


# ── Bild-Serve ──────────────────────────────────────────────────────────────────

@diskhub.route('/diskhub/assets/<disc_id>/<filename>')
def serve_diskhub_asset(disc_id, filename):
    """
    Servt Bilder aus discussions/<disc_id>/assets/.

    Query-Params:
      sub_id (str, optional) — Sub-Diskussion
    """
    sub_id = request.args.get('sub_id', '').strip()
    if sub_id:
        assets_dir = os.path.join(DISCUSSIONS_DIR, disc_id, sub_id, 'assets')
    else:
        assets_dir = os.path.join(DISCUSSIONS_DIR, disc_id, 'assets')

    if not os.path.isdir(assets_dir):
        return jsonify({'error': 'Assets-Ordner nicht gefunden'}), 404

    safe_name = os.path.basename(filename)
    if not safe_name:
        return jsonify({'error': 'Ungültiger Dateiname'}), 400

    try:
        return send_from_directory(assets_dir, safe_name)
    except FileNotFoundError:
        return jsonify({'error': 'Datei nicht gefunden'}), 404


@diskhub.route('/diskhub/git-log/<discussion_id>', methods=['GET'])
def get_git_log(discussion_id):
    """
    Git-History für eine Diskussion (Technisch-Tab).

    Query-Params:
      sub_id (str, optional) — Sub-Diskussion
      max_count (int, optional) — Max Commits (default: 50)

    Returns: { commits: [{ sha, author, date, message, files_changed, insertions, deletions }] }
    """
    sub_id = request.args.get('sub_id', '')
    try:
        max_count = min(int(request.args.get('max_count', 50)), 200)
    except (ValueError, TypeError):
        max_count = 50

    if sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    if not os.path.isdir(target_dir):
        return jsonify({'error': 'Diskussion nicht gefunden'}), 404

    try:
        # Git log mit detaillierten Stats
        result = subprocess.run(
            ['git', 'log', f'--max-count={max_count}',
             '--format=%H|%an|%ad|%s',
             '--date=short', '--shortstat', '--', '.'],
            capture_output=True, text=True, timeout=10,
            cwd=target_dir,
        )
        if result.returncode != 0:
            return jsonify({'commits': [], 'error': result.stderr.strip()})

        # Parse: format wechselt zwischen log-line und shortstat
        lines = result.stdout.strip().split('\n')
        commits = []
        current = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Log-Line: SHA|Author|Date|Message
            if '|' in line and not line.startswith(' '):
                if current:
                    commits.append(current)
                parts = line.split('|', 3)
                current = {
                    'sha': parts[0][:7] if len(parts) > 0 else '',
                    'author': parts[1] if len(parts) > 1 else '',
                    'date': parts[2] if len(parts) > 2 else '',
                    'message': parts[3] if len(parts) > 3 else '',
                    'files_changed': 0,
                    'insertions': 0,
                    'deletions': 0,
                }
            # Shortstat: 1 file changed, 2 insertions(+), 1 deletion(-)
            elif current and ('file changed' in line or 'files changed' in line):
                import re as _re
                fc = _re.search(r'(\d+) files? changed', line)
                ins = _re.search(r'(\d+) insertions?\(\+\)', line)
                del_ = _re.search(r'(\d+) deletions?\(-\)', line)
                if fc:
                    current['files_changed'] = int(fc.group(1))
                if ins:
                    current['insertions'] = int(ins.group(1))
                if del_:
                    current['deletions'] = int(del_.group(1))

        if current:
            commits.append(current)

        return jsonify({'commits': commits, 'total': len(commits)})

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Git timeout'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — Discord-Integration
# ═══════════════════════════════════════════════════════════════════════════════

@diskhub.route('/diskhub/start-session', methods=['POST'])
def start_session():
    """
    Startet eine Discord-Session per 3er-Webhook-Call.

    Body:
      discussion_id (str) — z.B. 'gateway-standardisierung'
      is_sub (bool, optional) — Sub-Diskussion?
      sub_id (str, optional) — Sub-Diskussions-ID

    Webhook-Calls:
      1. /new — frische Hermes-Session starten
      2. /title disc-<discussion_id> — Session benennen (für Polling-Mapping)
      3. Kontext-Prompt — "Lies die Datei, gib Verständnis wieder, diskutiere"
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id:
        return jsonify({'error': 'discussion_id erforderlich'}), 400

    webhook_url = WEBHOOK_URL
    bot_mention = BOT_MENTION

    if not webhook_url:
        return jsonify({'error': 'Keine Webhook-URL konfiguriert'}), 500

    # Session-Titel für Polling — lesbares Datum+Uhrzeit zur Identifikation
    now = datetime.now(timezone.utc)
    date_str = now.strftime('%d.%m.%y')
    time_str = now.strftime('%H.%M')
    session_title = f'disc-{discussion_id}-{date_str}-{time_str}'
    if is_sub and sub_id:
        session_title = f'disc-{discussion_id}-{sub_id}-{date_str}-{time_str}'

    # Datei-Pfad für Kontext-Prompt — bevorzugt index.md, Fallback blocks.md
    if is_sub and sub_id:
        target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id, 'index.md')
        if not os.path.isfile(target_file):
            target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id, 'blocks.md')
    else:
        target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, 'index.md')
        if not os.path.isfile(target_file):
            target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, 'blocks.md')

    context_prompt = (
        f"Lies die Datei {target_file} vollständig. "
        f"Gib dein Verständnis dieser Diskussion wieder. "
        f"Diskutiere mit dem User — sammle neue Argumente, "
        f"hinterfrage Annahmen, schlage nächste Schritte vor."
    )

    statuses = []

    # Schritt 1: /new
    s1 = _send_webhook(webhook_url, '/new', bot_mention)
    statuses.append(s1)

    if s1 == 204:
        time.sleep(2)  # Kurze Pause zwischen Calls

    # Schritt 2: /title
    s2 = _send_webhook(webhook_url, f'/title {session_title}', bot_mention)
    statuses.append(s2)

    if s2 in (200, 204):
        time.sleep(1)

    # Schritt 3: Kontext-Prompt
    s3 = _send_webhook(webhook_url, context_prompt, bot_mention)
    statuses.append(s3)

    _log_activity('start-session', {
        'discussion': discussion_id,
        'session_title': session_title,
        'statuses': statuses,
        'is_sub': is_sub,
        'sub_id': sub_id,
    })

    all_ok = all(s == 204 for s in statuses)
    return jsonify({
        'status': 'triggered' if all_ok else 'partial',
        'session_title': session_title,
        'webhook_statuses': statuses,
        'summary': '✅ Session gestartet' if all_ok else '⚠️ Teilweise fehlgeschlagen',
    })


@diskhub.route('/diskhub/session-status', methods=['GET'])
def get_session_status():
    """
    Pollt state.db nach einer Session mit bestimmtem Titel.
    Fallback: falls Titel-Suche leer und since gesetzt → neueste aktive Session seit since.

    Query-Params:
      title (str) — Session-Titel zum Suchen (z.B. 'disc-gateway-standardisierung')
      since (float, optional) — Unix-Timestamp, nur Sessions danach

    Returns: { found: bool, session: {...} or null }
    """
    search_title = request.args.get('title', '').strip()
    since = request.args.get('since')

    if not search_title:
        return jsonify({'error': 'title erforderlich'}), 400

    sessions = _query_state_db(search_title)

    # Nach Zeit filtern
    if since:
        try:
            since_ts = float(since)
            sessions = [s for s in sessions if s.get('started_at') and s['started_at'] >= since_ts]
        except (ValueError, TypeError):
            pass

    if not sessions:
        # Fallback: Title-LIKE hat nichts gefunden → neueste aktive Session seit since
        if since:
            try:
                since_ts = float(since)
                all_recent = _query_state_db()  # ohne Title-Filter, letzte 20
                fallback = [
                    s for s in all_recent
                    if s.get('started_at') and s['started_at'] >= since_ts
                    and s.get('ended_at') is None  # nur aktive Sessions
                ]
                if fallback:
                    sessions = fallback
            except (ValueError, TypeError):
                pass

    if not sessions:
        return jsonify({'found': False, 'session': None})

    latest = sessions[0]
    is_active = latest.get('ended_at') is None

    return jsonify({
        'found': True,
        'session': {
            'id': latest['id'],
            'title': latest.get('title'),
            'source': latest.get('source'),
            'started_at': _format_timestamp(latest.get('started_at')),
            'started_ts': latest.get('started_at'),
            'ended_at': _format_timestamp(latest.get('ended_at')),
            'message_count': latest.get('message_count', 0),
            'active': is_active,
        }
    })


@diskhub.route('/diskhub/session-messages/<session_id>', methods=['GET'])
def get_session_messages(session_id):
    """
    Holt alle Nachrichten einer Session aus state.db.

    Gibt gefilterte Nachrichten zurück:
      - user: Max (lila)
      - assistant: Hermi (grün)
      - tool: Wird als System-Nachricht mit verkürztem Content angezeigt
    """
    raw_messages = _get_session_messages(session_id)
    if not raw_messages:
        return jsonify({'messages': [], 'total': 0})

    # Session-Info
    sessions = _query_state_db(session_id)
    session_info = sessions[0] if sessions else None

    # Nachrichten aufbereiten
    messages = []
    for m in raw_messages:
        role = m.get('role', '')
        content = m.get('content', '') or ''

        # Tool-Nachrichten: Content kürzen
        if role == 'tool':
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and 'content' in parsed:
                    content = parsed['content']
            except (json.JSONDecodeError, TypeError):
                pass
            if len(content) > 200:
                content = content[:200] + '…'
        elif role == 'session_meta':
            continue  # Meta-Zeilen überspringen

        messages.append({
            'role': role,
            'content': content,
            'timestamp': _format_timestamp(m.get('timestamp')),
            'ts': m.get('timestamp'),
        })

    return jsonify({
        'session_id': session_id,
        'session_info': {
            'title': session_info.get('title') if session_info else None,
            'started_at': _format_timestamp(session_info.get('started_at')) if session_info else None,
            'active': session_info.get('ended_at') is None if session_info else False,
        } if session_info else None,
        'messages': messages,
        'total': len(messages),
    })


@diskhub.route('/diskhub/session-messages-stream/<session_id>', methods=['GET'])
def stream_session_messages(session_id):
    """
    SSE-Endpoint: Streamt neue Nachrichten einer Session.
    Ersetzt das alle-8s-Polling durch Push.

    Query-Params:
      since_ts (float, optional) — Unix-Timestamp, nur Nachrichten danach

    Streamt Events: data: {"messages": [...], "total_new": N}
    Keepalive: : keepalive (alle 30s)
    Timeout: Browser schließt nach Inaktivität, Client reconnectiert
    """
    since_ts = request.args.get('since_ts', '0')
    try:
        since_ts = float(since_ts)
    except (ValueError, TypeError):
        since_ts = 0

    def generate():
        last_max_ts = since_ts
        tick = 0
        try:
            while True:
                new_messages = _get_session_messages_since(session_id, last_max_ts)
                if new_messages:
                    # Max-Timestamp für nächsten Poll
                    try:
                        new_max = max(
                            float(m['timestamp']) for m in new_messages
                            if m.get('timestamp') is not None
                        )
                    except (ValueError, TypeError):
                        new_max = last_max_ts

                    # Nachrichten aufbereiten (wie get_session_messages)
                    filtered = []
                    for m in new_messages:
                        role = m.get('role', '')
                        content = m.get('content', '') or ''
                        if role == 'tool':
                            try:
                                parsed = json.loads(content)
                                if isinstance(parsed, dict) and 'content' in parsed:
                                    content = parsed['content']
                            except (json.JSONDecodeError, TypeError):
                                pass
                            if len(content) > 200:
                                content = content[:200] + '…'
                        elif role == 'session_meta':
                            continue
                        filtered.append({
                            'role': role,
                            'content': content,
                            'timestamp': _format_timestamp(m.get('timestamp')),
                            'ts': m.get('timestamp'),
                        })

                    if filtered:
                        yield f"data: {json.dumps({'messages': filtered, 'total_new': len(filtered)})}\n\n"
                        last_max_ts = new_max

                tick += 1
                if tick % 15 == 0:
                    yield ": keepalive\n\n"

                time.sleep(2)
        except GeneratorExit:
            pass

    return FlaskResponse(
        generate(),
        mimetype='text/event-stream',
        headers={
            'X-Accel-Buffering': 'no',
            'Cache-Control': 'no-cache, no-store',
            'Connection': 'keep-alive',
        }
    )


@diskhub.route('/diskhub/adopt-block', methods=['POST'])
def adopt_block():
    """
    'In Dokument übernehmen' — Headless Hermes schreibt Block in index.md + git commit.

    Body:
      discussion_id (str)
      block_content (str) — Der zu schreibende Block (Markdown)
      position (str, optional) — Position-Hinweis (z.B. 'Nach Block: Sub: Docker-Label')
      images (list, optional) — [{url, filename}] für Bild-Download
      is_sub (bool, optional)
      sub_id (str, optional)
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    block_content = data.get('block_content', '')
    position = data.get('position', '')
    images = data.get('images', [])
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or not block_content:
        return jsonify({'error': 'discussion_id und block_content erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    blocks_path = os.path.join(target_dir, 'blocks.md')

    if not os.path.isfile(blocks_path):
        # blocks.md existiert noch nicht — anlegen mit Header
        header_lines = [f'# Blöcke — {discussion_id}\n']
        if is_sub and sub_id:
            header_lines = [f'# Blöcke — {discussion_id}/{sub_id}\n']
        header_lines.append('\n---\n\n')
        try:
            with open(blocks_path, 'w') as f:
                f.writelines(header_lines)
        except Exception as e:
            return jsonify({'error': f'blocks.md anlegen fehlgeschlagen: {e}'}), 500

    # Prompt für Hermes bauen
    prompt_parts = [
        f"Schreibe folgenden Block in die Datei {blocks_path}.",
    ]

    if position:
        prompt_parts.append(f"Position: {position}")

    prompt_parts.append(f"")
    prompt_parts.append(block_content)
    prompt_parts.append("")

    if images:
        prompt_parts.append("Lade folgende Bilder herunter und speichere sie in assets/:")
        for img in images:
            prompt_parts.append(f"  - {img.get('url', '')} → assets/{img.get('filename', 'bild.png')}")
        prompt_parts.append("Ersetze Discord-URLs durch relative Pfade im Markdown.")

    prompt_parts.append("")
    prompt_parts.append("Führe danach aus:")
    prompt_parts.append(f"  cd {REPO_DIR}")
    prompt_parts.append("  git add -A")
    prompt_parts.append(f"  git commit -m \"disc: {discussion_id}: neuer Block per DiskHub\"")

    if is_sub and sub_id:
        prompt_parts[-1] = f"  git commit -m \"disc: {discussion_id}/{sub_id}: neuer Block per DiskHub\""

    prompt_parts.append("")
    prompt_parts.append("Antworte nur mit: ✅ Übernommen: <short-sha>")

    prompt = "\n".join(prompt_parts)
    result = _run_hermes_cli(prompt)

    sha = ''
    if result['success']:
        # Extrahiere SHA aus Antwort
        sha_match = re.search(r'✅ Übernommen:?\s*(\S+)', result['output'])
        if sha_match:
            sha = sha_match.group(1)

    _log_activity('adopt-block', {
        'discussion': discussion_id,
        'success': result['success'],
        'sha': sha,
        'is_sub': is_sub,
        'sub_id': sub_id,
    })

    # Fehlerklassifikation
    error_type = 'unknown'
    error_text = result['output'][:500] if result['output'] else 'Unbekannter Fehler'

    if not result['success']:
        output_lower = (result.get('output', '') or '').lower()
        raw_lower = (result.get('raw', '') or '').lower()
        combined = output_lower + ' ' + raw_lower

        if 'timeout' in combined and '60s' in combined:
            error_type = 'timeout'
        elif 'position' in combined and ('nicht gefunden' in combined or 'not found' in combined or 'exist' in combined):
            error_type = 'position_error'
        elif 'nicht lesbar' in combined or 'cannot read' in combined or 'no such file' in combined or 'not readable' in combined:
            error_type = 'file_error'
        elif 'bild' in combined and ('nicht geladen' in combined or 'failed' in combined or 'error' in combined):
            error_type = 'image_error'
        elif 'merge conflict' in combined or 'git conflict' in combined or 'conflict' in combined:
            error_type = 'git_conflict'

    if result['success']:
        return jsonify({'status': 'ok', 'sha': sha, 'error_type': None, 'output': result['output'][:300]})
    else:
        return jsonify({
            'status': 'error',
            'error_type': error_type,
            'error': error_text,
        }), 500


@diskhub.route('/diskhub/generate-summary', methods=['POST'])
def generate_summary():
    """
    'Von Hermi generieren' — Headless Call fasst Nachrichten + Notizen zusammen.

    Body:
      discussion_id (str)
      selected_messages (list) — [{role, content, timestamp}]
      user_notes (str, optional) — Stichpunkte aus dem Editor
      is_sub (bool, optional)
      sub_id (str, optional)
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    selected = data.get('selected_messages', [])
    user_notes = data.get('user_notes', '')

    if not discussion_id:
        return jsonify({'error': 'discussion_id erforderlich'}), 400

    # Nachrichten-Text bauen
    msg_lines = []
    for m in selected:
        role = m.get('role', 'unknown')
        content = m.get('content', '')[:500]  # Auf 500 Zeichen kürzen
        ts = m.get('timestamp', '')
        msg_lines.append(f"[{ts}] {role}: {content}")

    msgs_text = "\n".join(msg_lines) if msg_lines else "(keine Nachrichten ausgewählt)"

    prompt = (
        f"Fasse folgende Discord-Nachrichten aus der Diskussion '{discussion_id}' "
        f"zu einem strukturierten Diskussionsblock zusammen.\n\n"
        f"Nachrichten:\n{msgs_text}\n\n"
    )

    if user_notes:
        prompt += f"Zusätzliche Notizen/Stichpunkte:\n{user_notes}\n\n"

    prompt += (
        "Formatiere den Block als Markdown mit:\n"
        "- Titel (### Block: <Kurztitel>)\n"
        "- Zusammenfassung der Kernpunkte\n"
        "- Offene Fragen (falls vorhanden)\n"
        "- Fußnote mit *session: disc-<name> · <Datum>*\n\n"
        "Antworte NUR mit dem fertigen Block, keinem sonstigen Text."
    )

    result = _run_hermes_cli(prompt)

    _log_activity('generate-summary', {
        'discussion': discussion_id,
        'success': result['success'],
        'selected_count': len(selected),
    })

    if result['success']:
        return jsonify({'status': 'ok', 'summary': result['output']})
    else:
        return jsonify({'status': 'error', 'error': result['output'][:500]}), 500


@diskhub.route('/diskhub/suggest-readme', methods=['GET'])
def suggest_readme():
    """
    'README aktualisieren' (Vorschlag) — Headless Call vergleicht README mit index.md.

    Query-Params:
      discussion_id (str)
      is_sub (bool, optional)
      sub_id (str, optional)
    """
    discussion_id = request.args.get('discussion_id', '')
    is_sub = request.args.get('is_sub', 'false').lower() == 'true'
    sub_id = request.args.get('sub_id', '')

    if not discussion_id:
        return jsonify({'error': 'discussion_id erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    readme_path = os.path.join(target_dir, 'README.md')
    index_path = os.path.join(target_dir, 'index.md')

    current_readme = _read_file_content(readme_path)
    current_index = _read_file_content(index_path)

    if not current_index:
        return jsonify({'error': 'index.md nicht gefunden'}), 404
    if not current_readme:
        current_readme = '(noch keine README vorhanden)'

    prompt = (
        f"Vergleiche README.md und index.md aus dem Ordner {target_dir}.\n\n"
        f"Aktuelle README.md:\n{current_readme}\n\n"
        f"Aktuelle index.md:\n{current_index}\n\n"
        f"1. Welche Blöcke in index.md sind NEU (in README noch nicht aufgeführt)?\n"
        f"2. Welche Blöcke/Status haben sich geändert?\n"
        f"3. Schlage eine AKTUALISIERTE README.md vor (vollständiger Text).\n\n"
        f"Antworte NUR mit dem vollständigen neuen README-Inhalt, "
        f"angefangen bei '# <Titel>' — kein sonstiger Text, keine Erklärungen."
    )

    result = _run_hermes_cli(prompt)

    _log_activity('suggest-readme', {
        'discussion': discussion_id,
        'success': result['success'],
    })

    if result['success']:
        return jsonify({
            'status': 'ok',
            'current_readme': current_readme,
            'suggested_readme': result['output'],
        })
    else:
        return jsonify({'status': 'error', 'error': result['output'][:500]}), 500


@diskhub.route('/diskhub/update-readme', methods=['POST'])
def update_readme():
    """
    'README aktualisieren' (Übernehmen) — Schreibt neue README + git commit.

    Body:
      discussion_id (str)
      new_readme (str) — Vollständiger neuer README-Inhalt
      is_sub (bool, optional)
      sub_id (str, optional)
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    new_readme = data.get('new_readme', '')
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or not new_readme:
        return jsonify({'error': 'discussion_id und new_readme erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    readme_path = os.path.join(target_dir, 'README.md')

    try:
        with open(readme_path, 'w') as f:
            f.write(new_readme)
    except Exception as e:
        return jsonify({'error': f'Schreiben fehlgeschlagen: {e}'}), 500

    # Git commit
    try:
        subprocess.run(
            ['git', 'add', '-A'],
            capture_output=True, text=True, timeout=10, cwd=target_dir
        )
        commit_msg = f"disc: {discussion_id}: README aktualisiert"
        if is_sub and sub_id:
            commit_msg = f"disc: {discussion_id}/{sub_id}: README aktualisiert"
        result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True, text=True, timeout=10, cwd=REPO_DIR
        )
        sha = ''
        if result.returncode == 0:
            sha_match = re.search(r'\[master [a-f0-9]+\) ([a-f0-9]+)', result.stdout)
            if sha_match:
                sha = sha_match.group(1)
            _git_push()
    except Exception as e:
        sha = f'commit fehlgeschlagen: {e}'

    _log_activity('update-readme', {
        'discussion': discussion_id,
        'sha': sha,
    })

    return jsonify({'status': 'ok', 'sha': sha})


@diskhub.route('/diskhub/start-sub-discussion', methods=['POST'])
def start_sub_discussion():
    """
    Startet eine Sub-Diskussion — gleicher 3er-Webhook wie start-session,
    aber mit Sub-Kontext.

    Body:
      discussion_id (str) — Haupt-Diskussion
      sub_id (str) — Sub-Diskussions-ID
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    sub_id = data.get('sub_id', '')

    if not discussion_id or not sub_id:
        return jsonify({'error': 'discussion_id und sub_id erforderlich'}), 400

    # Einfach start-session mit is_sub=true aufrufen
    # Da wir im selben Blueprint sind, bauen wir den Aufruf manuell

    webhook_url = WEBHOOK_URL
    bot_mention = BOT_MENTION

    if not webhook_url:
        return jsonify({'error': 'Keine Webhook-URL konfiguriert'}), 500

    session_title = f'disc-{discussion_id}-{sub_id}'
    target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id, 'index.md')
    if not os.path.isfile(target_file):
        target_file = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id, 'blocks.md')

    context_prompt = (
        f"Lies die Datei {target_file} vollständig. "
        f"Dies ist eine Sub-Diskussion zu '{discussion_id}'. "
        f"Gib dein Verständnis wieder. "
        f"Diskutiere mit dem User — fokussiere auf dieses Unterthema."
    )

    statuses = []
    s1 = _send_webhook(webhook_url, '/new', bot_mention)
    statuses.append(s1)
    if s1 == 204:
        time.sleep(2)
    s2 = _send_webhook(webhook_url, f'/title {session_title}', bot_mention)
    statuses.append(s2)
    if s2 in (200, 204):
        time.sleep(1)
    s3 = _send_webhook(webhook_url, context_prompt, bot_mention)
    statuses.append(s3)

    _log_activity('start-sub-discussion', {
        'discussion': discussion_id,
        'sub_id': sub_id,
        'session_title': session_title,
        'statuses': statuses,
    })

    all_ok = all(s == 204 for s in statuses)
    return jsonify({
        'status': 'triggered' if all_ok else 'partial',
        'session_title': session_title,
        'webhook_statuses': statuses,
    })


@diskhub.route('/diskhub/promote-block', methods=['POST'])
def promote_block():
    """Promoted einen Block aus blocks.md zu einer Sub-Diskussion."""
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    block_title = data.get('block_title', '')
    block_content = data.get('block_content', '')
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or not block_title:
        return jsonify({'error': 'discussion_id und block_title erforderlich'}), 400

    if is_sub and sub_id:
        parent_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        parent_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    if not os.path.isdir(parent_dir):
        return jsonify({'error': 'Eltern-Diskussion nicht gefunden'}), 404

    sub_folder_id = re.sub(r'[^a-z0-9]+', '-', block_title.lower()).strip('-')
    if not sub_folder_id:
        sub_folder_id = 'block-' + str(int(time.time()))

    sub_dir = os.path.join(parent_dir, sub_folder_id)
    if os.path.isdir(sub_dir):
        return jsonify({'error': 'Sub-Diskussion existiert bereits: ' + sub_folder_id}), 409

    try:
        os.makedirs(sub_dir)
        today = datetime.now(timezone.utc).strftime('%d.%m.%Y')

        # 1. README.md
        readme = (
            '# ' + block_title + '\n\n'
            '**Erstellt:** ' + today + ' · **Status:** ● offen\n\n'
            'Promoted from block.\n\n'
            + block_content + '\n'
        )
        with open(os.path.join(sub_dir, 'README.md'), 'w') as f:
            f.write(readme)

        # 2. index.md
        index = (
            '# ' + block_title + '\n\n'
            + block_content + '\n\n'
            '---\n\n'
            '💬 **Sub-Diskussion fortsetzen**\n'
        )
        with open(os.path.join(sub_dir, 'index.md'), 'w') as f:
            f.write(index)

        # 3. blocks.md
        blocks = '# Blöcke - ' + discussion_id + '/' + sub_folder_id + '\n\n---\n'
        with open(os.path.join(sub_dir, 'blocks.md'), 'w') as f:
            f.write(blocks)

        # 4. Block aus blocks.md entfernen
        blocks_path = os.path.join(parent_dir, 'blocks.md')
        if os.path.isfile(blocks_path):
            with open(blocks_path, 'r') as f:
                lines = f.readlines()
            new_lines = []
            skip = False
            in_block = False
            for line in lines:
                stripped = line.lstrip()
                if stripped.startswith('### ') and block_title in line:
                    in_block = True
                    skip = True
                    continue
                elif stripped.startswith('### ') and in_block:
                    in_block = False
                    skip = False
                if not skip:
                    new_lines.append(line)
            with open(blocks_path, 'w') as f:
                f.writelines(new_lines)

        # 5. Eintrag in Haupt-index.md
        index_path = os.path.join(parent_dir, 'index.md')
        entry = (
            '\n### Sub: ' + block_title + '\n\n'
            '*\u2014 \u00b7 ' + today + '*\n\n'
            '> **Ergebnis:** Promoted from block\n'
        )
        if os.path.isfile(index_path):
            with open(index_path, 'a') as f:
                f.write(entry)

        # 6. Git commit
        try:
            subprocess.run(
                ['git', 'add', '-A'],
                capture_output=True, text=True, timeout=10, cwd=REPO_DIR
            )
            subprocess.run(
                ['git', 'commit', '-m', 'disc: ' + discussion_id + ': promoted block -> ' + sub_folder_id],
                capture_output=True, text=True, timeout=10, cwd=REPO_DIR
            )
            _git_push()
        except Exception:
            pass

        _log_activity('promote-block', {
            'discussion': discussion_id,
            'block_title': block_title,
            'sub_id': sub_folder_id,
            'is_sub': is_sub,
        })

        return jsonify({'status': 'ok', 'sub_id': sub_folder_id, 'sub_name': block_title})

    except Exception as e:
        return jsonify({'error': 'Promotion fehlgeschlagen: ' + str(e)}), 500


@diskhub.route('/diskhub/start-box-to-sub', methods=['POST'])
def start_box_to_sub():
    """
    'Zu Sub ändern' — Startet Session mit Box-Content als Kontext (3er-Webhook).

    Body:
      discussion_id (str)
      box_title (str) — Titel der Box
      box_content (str) — Content der Box
      is_sub (bool, optional)
      sub_id (str, optional)
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    box_title = data.get('box_title', '').strip()
    box_content = data.get('box_content', '').strip()
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or not box_title:
        return jsonify({'error': 'discussion_id und box_title erforderlich'}), 400

    webhook_url = WEBHOOK_URL
    bot_mention = BOT_MENTION
    if not webhook_url:
        return jsonify({'error': 'Keine Webhook-URL konfiguriert'}), 500

    now = datetime.now(timezone.utc)
    date_str = now.strftime('%d.%m.%y')
    time_str = now.strftime('%H.%M')
    session_title = f'disc-{discussion_id}-convert-{box_title[:20].lower().replace(" ", "-")}-{date_str}-{time_str}'

    context_prompt = (
        f"📦 **Box: {box_title}** zur Diskussion '{discussion_id}'"
        + (f"/{sub_id}" if is_sub and sub_id else "")
        + ".\n\n"
        f"**Inhalt der Box:**\n{box_content}\n\n"
        f"**Aufgabe:** Gehe diesen Box-Inhalt mit dem User durch. "
        f"Diskutiere die Ideen, hinterfrage Annahmen, sammle Feedback. "
        f"Leite am Ende 1-n konkrete Sub-Diskussions-Vorschläge ab, "
        f"die automatisch als neue Sub-Diskussionen angelegt werden können. "
        f"Jeder Vorschlag sollte einen klaren Titel und eine kurze Beschreibung haben."
    )

    statuses = []
    s1 = _send_webhook(webhook_url, '/new', bot_mention)
    statuses.append(s1)
    if s1 == 204:
        time.sleep(2)
    s2 = _send_webhook(webhook_url, f'/title {session_title}', bot_mention)
    statuses.append(s2)
    if s2 in (200, 204):
        time.sleep(1)
    s3 = _send_webhook(webhook_url, context_prompt, bot_mention)
    statuses.append(s3)

    _log_activity('start-box-to-sub', {
        'discussion': discussion_id,
        'box_title': box_title,
        'session_title': session_title,
        'statuses': statuses,
        'is_sub': is_sub,
        'sub_id': sub_id,
    })

    all_ok = all(s == 204 for s in statuses)
    return jsonify({
        'status': 'triggered' if all_ok else 'partial',
        'session_title': session_title,
        'webhook_statuses': statuses,
        'summary': '✅ Session gestartet' if all_ok else '⚠️ Teilweise fehlgeschlagen',
    })


@diskhub.route('/diskhub/delete-block', methods=['POST'])
def delete_block():
    """'Textbox löschen' — Entfernt einen Block aus blocks.md + git commit."""
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    block_index = data.get('block_index')
    file_name = data.get('file_name', '').strip()
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or (block_index is None and not file_name):
        return jsonify({'error': 'discussion_id und block_index (oder file_name) erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    if file_name:
        # ── Einzeldatei-Modus (blocks/<file_name>.md löschen) ──
        filepath = os.path.join(target_dir, 'blocks', f'{file_name}.md')
        if not os.path.isfile(filepath):
            return jsonify({'error': f'Datei blocks/{file_name}.md nicht gefunden'}), 404
        os.remove(filepath)
        deleted_preview = f'blocks/{file_name}.md'
        blocks_left = len([f for f in os.listdir(os.path.join(target_dir, 'blocks')) if f.endswith('.md')])
    else:
        # ── Fallback: block_index auf blocks.md ──
        blocks_path = os.path.join(target_dir, 'blocks.md')
        if not os.path.isfile(blocks_path):
            return jsonify({'error': 'blocks.md nicht gefunden'}), 404

        with open(blocks_path, 'r') as f:
            lines = f.readlines()

        # Find ### header boundaries
        header_indices = [i for i, line in enumerate(lines) if line.startswith('### ')]

        if block_index < 0 or block_index >= len(header_indices):
            return jsonify({'error': f'block_index {block_index} ungültig (0-{len(header_indices)-1})'}), 400

        start = header_indices[block_index]
        end = header_indices[block_index + 1] if block_index + 1 < len(header_indices) else len(lines)

        # Sicherheitscheck: Block-Preview für Log
        deleted_preview = ''.join(lines[start:end])[:100]

        new_lines = lines[:start] + lines[end:]

        with open(blocks_path, 'w') as f:
            f.writelines(new_lines)
        blocks_left = len(header_indices) - 1

    sha = ''
    try:
        subprocess.run(['git', 'add', '-A'], capture_output=True, text=True, timeout=10, cwd=REPO_DIR)
        commit_msg = f'disc: {discussion_id}: Block gelöscht'
        if file_name:
            commit_msg += f' ({file_name})'
        else:
            commit_msg += f' (Index {block_index})'
        result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True, text=True, timeout=10, cwd=REPO_DIR
        )
        if result.returncode == 0:
            sha_match = re.search(r'\[master [a-f0-9]+\) ([a-f0-9]+)', result.stdout)
            if sha_match:
                sha = sha_match.group(1)
            _git_push()
    except Exception as e:
        sha = f'commit fehlgeschlagen: {e}'

    _log_activity('delete-block', {
        'discussion': discussion_id,
        'block_index': block_index,
        'deleted_preview': deleted_preview,
        'sha': sha,
        'is_sub': is_sub,
        'sub_id': sub_id,
        'file_name': file_name,
    })

    return jsonify({'status': 'ok', 'sha': sha, 'blocks_left': blocks_left})


@diskhub.route('/diskhub/edit-block', methods=['POST'])
def edit_block():
    """'Textbox bearbeiten' — Überschreibt Titel + Inhalt eines Blocks in blocks.md + git commit."""
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    block_index = data.get('block_index')
    file_name = data.get('file_name', '').strip()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    content = _sanitize_internal_headings(content)
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or (block_index is None and not file_name) or not title:
        return jsonify({'error': 'discussion_id, block_index (oder file_name) und title erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    if file_name:
        # ── Einzeldatei-Modus (blocks/<file_name>.md) ──
        filepath = os.path.join(target_dir, 'blocks', f'{file_name}.md')
        if not os.path.isfile(filepath):
            return jsonify({'error': f'Datei blocks/{file_name}.md nicht gefunden'}), 404

        with open(filepath, 'r') as f:
            old_content = f.read()

        old_lines = old_content.split('\n')
        # Datumszeile finden (Zeile direkt nach ###, startet mit *—)
        date_line = None
        for i in range(1, min(3, len(old_lines))):
            if old_lines[i].strip().startswith('*—'):
                date_line = old_lines[i]
                break

        # Neuen Inhalt bauen: ### + Datum (falls vorhanden) + Content
        new_content = f'### {title}\n'
        if date_line:
            new_content += date_line + '\n'
        if content:
            new_content += '\n' + content + '\n'
        else:
            new_content += '\n'

        with open(filepath, 'w') as f:
            f.write(new_content)
    else:
        # ── Fallback: block_index auf blocks.md ──
        blocks_path = os.path.join(target_dir, 'blocks.md')
        if not os.path.isfile(blocks_path):
            return jsonify({'error': 'blocks.md nicht gefunden'}), 404

        with open(blocks_path, 'r') as f:
            lines = f.readlines()

        # Find ### header boundaries
        header_indices = [i for i, line in enumerate(lines) if line.startswith('### ')]

        if block_index < 0 or block_index >= len(header_indices):
            return jsonify({'error': f'block_index {block_index} ungültig (0-{len(header_indices)-1})'}), 400

        start = header_indices[block_index]
        end = header_indices[block_index + 1] if block_index + 1 < len(header_indices) else len(lines)

        # Original-Block-Lines holen
        old_block = lines[start:end]

        # Prüfen ob eine Datumszeile direkt nach ### existiert
        date_line = None
        content_start_offset = 1  # skip ### line
        if len(old_block) > 1 and old_block[1].strip().startswith('*—'):
            date_line = old_block[1]
            content_start_offset = 2

        # Neuen Block bauen: ### + Datum (falls vorhanden) + Leerzeile + Content + abschließende Leerzeile
        new_block = [f'### {title}\n']
        if date_line:
            new_block.append(date_line)
        if content:
            if new_block and not new_block[-1].endswith('\n\n') and not new_block[-1].strip() == '':
                new_block.append('\n')
            for cl in content.split('\n'):
                new_block.append(cl + '\n')
        else:
            if new_block and not new_block[-1].endswith('\n\n'):
                new_block.append('\n')
        if not new_block[-1].endswith('\n\n'):
            new_block.append('\n')

        new_lines = lines[:start] + new_block + lines[end:]

        with open(blocks_path, 'w') as f:
            f.writelines(new_lines)

    sha = ''
    try:
        subprocess.run(['git', 'add', '-A'], capture_output=True, text=True, timeout=10, cwd=REPO_DIR)
        commit_msg = f'disc: {discussion_id}: Block bearbeitet — {title}'
        if file_name:
            commit_msg += f' ({file_name})'
        result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True, text=True, timeout=10, cwd=REPO_DIR
        )
        if result.returncode == 0:
            sha_match = re.search(r'\[master [a-f0-9]+\) ([a-f0-9]+)', result.stdout)
            if sha_match:
                sha = sha_match.group(1)
            _git_push()
    except Exception as e:
        sha = f'commit fehlgeschlagen: {e}'

    _log_activity('edit-block', {
        'discussion': discussion_id,
        'block_index': block_index,
        'title': title,
        'sha': sha,
        'is_sub': is_sub,
        'sub_id': sub_id,
        'file_name': file_name,
    })

    return jsonify({'status': 'ok', 'sha': sha, 'file_name': file_name})


@diskhub.route('/diskhub/edit-index-title', methods=['POST'])
def edit_index_title():
    """'⬜/✅ Status-Toggle für index.md-Einträge'
    Unterstützt index/ Ordner (Einzeldateien, #H) und index.md Fallback.
    """
    data = request.get_json(silent=True) or {}
    discussion_id = data.get('discussion_id', '')
    entry_index = data.get('entry_index')
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id or entry_index is None:
        return jsonify({'error': 'discussion_id und entry_index erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    # #H: Einzeldateien aus index/ Ordner
    index_dir = os.path.join(target_dir, 'index')
    if os.path.isdir(index_dir):
        md_files = sorted([f for f in os.listdir(index_dir) if f.endswith('.md')])
        if entry_index < 0 or entry_index >= len(md_files):
            return jsonify({'error': f'entry_index {entry_index} ungültig (0-{len(md_files)-1})'}), 400
        filepath = os.path.join(index_dir, md_files[entry_index])
        with open(filepath, 'r') as f:
            lines = f.readlines()
        # Erste ###-Zeile finden und toggeln
        for i, line in enumerate(lines):
            if line.startswith('### '):
                heading_text = line[4:].rstrip('\n')
                if '(✓ erledigt)' in heading_text:
                    new_heading = re.sub(r'\s*\(✓ erledigt\)\s*', ' ', heading_text).strip()
                else:
                    new_heading = heading_text + ' (✓ erledigt)'
                lines[i] = f'### {new_heading}\n'
                break
        with open(filepath, 'w') as f:
            f.writelines(lines)
    else:
        # Fallback: index.md
        index_path = os.path.join(target_dir, 'index.md')
        if not os.path.isfile(index_path):
            return jsonify({'error': 'index.md nicht gefunden'}), 404

        with open(index_path, 'r') as f:
            lines = f.readlines()

        header_indices = [i for i, line in enumerate(lines) if line.startswith('### ')]

        if entry_index < 0 or entry_index >= len(header_indices):
            return jsonify({'error': f'entry_index {entry_index} ungültig (0-{len(header_indices)-1})'}), 400

        line_idx = header_indices[entry_index]
        old_line = lines[line_idx]
        heading_text = old_line[4:].rstrip('\n')

        if '(✓ erledigt)' in heading_text:
            new_heading = re.sub(r'\s*\(✓ erledigt\)\s*', ' ', heading_text).strip()
        else:
            new_heading = heading_text + ' (✓ erledigt)'

        lines[line_idx] = f'### {new_heading}\n'

        with open(index_path, 'w') as f:
            f.writelines(lines)

    # Git commit
    sha = ''
    try:
        subprocess.run(['git', 'add', '-A'], capture_output=True, text=True, timeout=10, cwd=REPO_DIR)
        result = subprocess.run(
            ['git', 'commit', '-m', f'disc: {discussion_id}: Index-Titel getoggelt — {new_heading[:40]}'],
            capture_output=True, text=True, timeout=10, cwd=REPO_DIR
        )
        if result.returncode == 0:
            sha_match = re.search(r'\[master ([a-f0-9]+)\]', result.stdout)
            if sha_match:
                sha = sha_match.group(1)
            _git_push()
    except Exception as e:
        sha = f'commit fehlgeschlagen: {e}'

    _log_activity('edit-index-title', {
        'discussion': discussion_id,
        'entry_index': entry_index,
        'new_title': new_heading,
        'sha': sha,
        'is_sub': is_sub,
        'sub_id': sub_id,
    })

    return jsonify({'status': 'ok', 'sha': sha})


def _auto_format_content(content: str) -> str:
    """
    Formatiert rohen Text in das Problem → Lösung → Status-Schema um.
    Erkennt bereits strukturierten Content an den Markern
    **Problem**, **Lösung**, **Status** und lässt ihn unverändert.
    """
    if not content or not content.strip():
        return ''

    key_markers = ['**Problem**', '**Lösung**', '**Status**']
    if any(m in content for m in key_markers):
        return content

    return (
        f"**Problem**\n{content}\n\n"
        f"**Lösung**\n—\n\n"
        f"**Status**\n🔜 offen"
    )


def _sanitize_internal_headings(text: str) -> str:
    """
    Wandelt interne ###-Zeilen in ## um — verhindert Ghost-Blöcke.
    Nur die erste Zeile (Block-Titel) darf ### haben.
    """
    if not text:
        return text
    lines = text.split('\n')
    filtered = []
    for line in lines:
        if line.startswith('### '):
            filtered.append('##' + line[3:])
        else:
            filtered.append(line)
    return '\n'.join(filtered)


@diskhub.route('/diskhub/add-box', methods=['POST'])
def add_box():
    """
    'Box hinzufügen' — Hängt einen neuen ###-Block an blocks.md an + git commit.
    Unterstützt JSON (alt) und multipart/form-data (neu mit optionalem image-Upload).

    Body (JSON):
      discussion_id (str)
      title (str)
      content (str, optional)
      is_sub (bool, optional)
      sub_id (str, optional)

    Body (multipart/form-data):
      discussion_id (str)
      title (str)
      content (str, optional)
      is_sub (str, optional — 'true'/'false')
      sub_id (str, optional)
      image (file, optional) — Bild-Datei (max 5MB, png/jpg/jpeg/gif/webp)
    """
    # ── Request parsen (JSON oder Multipart) ─────────────────────────────────
    data = request.get_json(silent=True) or {}
    image_file = None
    is_multipart = False

    if not data.get('discussion_id'):
        # Fallback auf multipart/form-data
        data = {}
        data['discussion_id'] = request.form.get('discussion_id', '')
        data['title'] = request.form.get('title', '')
        data['content'] = request.form.get('content', '')
        data['is_sub'] = request.form.get('is_sub', 'false').lower() == 'true'
        data['sub_id'] = request.form.get('sub_id', '')
        image_file = request.files.get('image')
        is_multipart = True

    discussion_id = data.get('discussion_id', '')
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    content = _auto_format_content(content)
    content = _sanitize_internal_headings(content)
    is_sub = data.get('is_sub', False)
    sub_id = data.get('sub_id', '')

    if not discussion_id:
        return jsonify({'error': 'discussion_id erforderlich'}), 400

    if is_sub and sub_id:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        target_dir = os.path.join(DISCUSSIONS_DIR, discussion_id)

    if not os.path.isdir(target_dir):
        return jsonify({'error': 'Diskussion nicht gefunden'}), 404

    # ── Bild verarbeiten ──────────────────────────────────────────────────────
    saved_image_path = None
    clean_title = title

    if image_file and image_file.filename:
        # 5MB-Limit prüfen
        image_file.seek(0, os.SEEK_END)
        size = image_file.tell()
        image_file.seek(0)
        if size > 5 * 1024 * 1024:
            return jsonify({'error': 'Bild zu groß — maximal 5 MB erlaubt'}), 413

        # Erlaubte Extensions
        ext = image_file.filename.rsplit('.', 1)[-1].lower() if '.' in image_file.filename else 'png'
        if ext not in ('png', 'jpg', 'jpeg', 'gif', 'webp'):
            ext = 'png'

        # assets/-Ordner anlegen
        assets_dir = os.path.join(target_dir, 'assets')
        os.makedirs(assets_dir, exist_ok=True)

        # Kollisionsfreien Dateinamen generieren
        date_prefix = datetime.now(timezone.utc).strftime('%d%m')
        counter = 1
        while True:
            filename = f'bild-{date_prefix}-{counter}.{ext}'
            saved_image_path = os.path.join(assets_dir, filename)
            if not os.path.exists(saved_image_path):
                break
            counter += 1

        image_file.save(saved_image_path)

        # Default-Titel bei fehlendem title (Bild-Modal ohne Texteingabe)
        if not title:
            now_ts = datetime.now(timezone.utc).strftime('%d.%m.%Y')
            title = f'Screenshot {now_ts}'
            clean_title = title

# 📷-Präfix + Bild-Referenz in Content
        title = f'📷 {title}'

        # Absoluter API-Pfad: der Serve-Endpoint unter /api/diskhub/assets/<disc_id>/<filename>
        # Sub-Diskussionen brauchen ?sub_id= damit der Endpoint den richtigen assets/-Ordner findet
        if is_sub and sub_id:
            asset_url = f'/api/diskhub/assets/{discussion_id}/{filename}?sub_id={sub_id}'
        else:
            asset_url = f'/api/diskhub/assets/{discussion_id}/{filename}'
        image_md = f'\n![{clean_title}]({asset_url})'
        content = content + image_md if content else image_md.strip()

    # ── Block schreiben ──────────────────────────────────────────────────────
    # #H — Einzeldatei-Modus wenn blocks/ existiert
    blocks_dir = os.path.join(target_dir, 'blocks')
    file_name = None

    if os.path.isdir(blocks_dir):
        # Nächste NN finden
        max_n = -1
        for f in os.listdir(blocks_dir):
            m = re.match(r'^(\d+)-', f)
            if m:
                n = int(m.group(1))
                if n > max_n:
                    max_n = n
        nn = f'{max_n + 1:02d}'
        # Slug aus Titel generieren
        slug = re.sub(r'[^a-z0-9-]', '-', title.lower())
        slug = re.sub(r'-+', '-', slug).strip('-')[:40]
        # Kollisionsschutz: wenn Datei existiert, -2, -3, … Suffix
        file_name = f'{nn}-{slug}'
        filepath = os.path.join(blocks_dir, f'{file_name}.md')
        counter = 0
        while os.path.exists(filepath):
            counter += 1
            file_name = f'{nn}-{slug}-{counter}'
            filepath = os.path.join(blocks_dir, f'{file_name}.md')
        today = datetime.now(timezone.utc).strftime('%d.%m.%Y')
        block_md = f'### {title}\n*— · {today}*\n\n{content}\n' if content else f'### {title}\n*— · {today}*\n'
        with open(filepath, 'w') as f:
            f.write(block_md)
    else:
        # Fallback: blocks.md (Sammeldatei)
        blocks_path = os.path.join(target_dir, 'blocks.md')
        if not os.path.isfile(blocks_path):
            name = f'{discussion_id}/{sub_id}' if is_sub and sub_id else discussion_id
            with open(blocks_path, 'w') as f:
                f.write(f'# Blöcke — {name}\n\n---\n\n')
        today = datetime.now(timezone.utc).strftime('%d.%m.%Y')
        block_md = f'\n### {title}\n*— · {today}*\n\n{content}\n' if content else f'\n### {title}\n*— · {today}*\n'
        with open(blocks_path, 'a') as f:
            f.write(block_md)

    # Git commit
    sha = ''
    try:
        subprocess.run(['git', 'add', '-A'], capture_output=True, text=True, timeout=10, cwd=REPO_DIR)
        commit_msg = f'disc: {discussion_id}: neue Box — {clean_title}'
        if file_name:
            commit_msg += f' ({file_name})'
        if is_sub and sub_id:
            commit_msg = f'disc: {discussion_id}/{sub_id}: neue Box — {clean_title}'
            if file_name:
                commit_msg += f' ({file_name})'
        result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True, text=True, timeout=10, cwd=REPO_DIR
        )
        if result.returncode == 0:
            sha_match = re.search(r'\[master [a-f0-9]+\) ([a-f0-9]+)', result.stdout)
            if sha_match:
                sha = sha_match.group(1)
            _git_push()
    except Exception as e:
        sha = f'commit fehlgeschlagen: {e}'

    _log_activity('add-box', {
        'discussion': discussion_id,
        'title': clean_title,
        'sha': sha,
        'is_sub': is_sub,
        'sub_id': sub_id,
        'has_image': bool(image_file and image_file.filename),
        'file_name': file_name,
    })

    return jsonify({'status': 'ok', 'sha': sha, 'file_name': file_name})