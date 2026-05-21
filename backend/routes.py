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
from flask import Blueprint, request, jsonify, Response as FlaskResponse

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

        # Sub-Diskussionen
        subs = []
        for sub_name in sorted(os.listdir(folder)):
            sub_folder = os.path.join(folder, sub_name)
            if os.path.isdir(sub_folder) and not sub_name.startswith('.') and sub_name != 'assets':
                sub_readme = os.path.join(sub_folder, 'README.md')
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
      sub_id (str, optional) — Sub-Diskussion laden statt Haupt-Diskussion
    """
    sub_id = request.args.get('sub_id', '').strip()
    
    if sub_id:
        folder = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_id)
    else:
        folder = os.path.join(DISCUSSIONS_DIR, discussion_id)
        
    if not os.path.isdir(folder):
        return jsonify({'error': 'Diskussion nicht gefunden'}), 404

    result = {'id': discussion_id, 'name': discussion_id.replace('-', ' ').title()}
    if sub_id:
        result['sub_id'] = sub_id
        result['sub_name'] = sub_id.replace('-', ' ').title()

    readme_path = os.path.join(folder, 'README.md')
    if os.path.isfile(readme_path):
        with open(readme_path, 'r') as f:
            readme_content = f.read()
        result['readme'] = readme_content
        header, body = _parse_discussion_header(readme_content)
        result['parsed'] = header
        result['readme_body'] = body

    # Blöcke (blocks.md) — flache Notizen ohne eigene Kinder
    blocks_path = os.path.join(folder, 'blocks.md')
    if os.path.isfile(blocks_path):
        with open(blocks_path, 'r') as f:
            result['blocks'] = f.read()

    index_path = os.path.join(folder, 'index.md')
    if os.path.isfile(index_path):
        with open(index_path, 'r') as f:
            result['index'] = f.read()

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
            subs.append(sub_data)
    result['subs'] = subs

    _log_activity('view', {'discussion': discussion_id, 'sub_id': sub_id or None})
    return jsonify(result)


@diskhub.route('/diskhub/health', methods=['GET'])
def health():
    """Health-Check."""
    return jsonify({'status': 'ok', 'discussions_count': len(_scan_discussions())})


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