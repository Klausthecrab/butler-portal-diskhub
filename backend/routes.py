"""
DiskHub Portal — Backend: Diskussions-Übersicht + CRUD.

Bietet API-Endpoints unter /api/diskhub/ für:
- Liste aller Diskussionen (sortiert nach letzter Änderung)
- Einzelne Diskussion lesen (index.md + README.md)
- (später) Session-Polling, Webhook-Trigger, "Übernehmen"
"""

import json
import os
import subprocess
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

diskhub = Blueprint('diskhub', __name__)

# --- Pfade ---
REPO_DIR = os.path.expanduser('~/repos/butler-portal-diskhub')
DISCUSSIONS_DIR = os.path.join(REPO_DIR, 'discussions')
ACTIVITY_LOG = os.path.expanduser('~/data/portal-logs/diskhub.json')


def init_diskhub(data_dir=None):
    """Portal-Loader-kompatible Init."""
    os.makedirs(DISCUSSIONS_DIR, exist_ok=True)


# --- Hilfsfunktionen ---

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


def _parse_readme_status(readme_path):
    """Liest README.md und extrahiert Status-Infos."""
    status = {
        'erledigt': 0,
        'offen': 0,
        'summary': '',
        'question': '',
    }
    if not os.path.isfile(readme_path):
        return status
    try:
        with open(readme_path, 'r') as f:
            content = f.read()
        import re
        # Zähle explizite Status-Angaben ("2 erledigt", "1 offen")
        done_nums = re.findall(r'(\d+)\s*erledigt', content.lower())
        open_nums = re.findall(r'(\d+)\s*offen', content.lower())
        if done_nums:
            status['erledigt'] = max(int(n) for n in done_nums)
        if open_nums:
            status['offen'] = max(int(n) for n in open_nums)
        # Fallback: zähle ✅ und ● wenn keine Zahlen gefunden
        if not done_nums:
            status['erledigt'] = content.count('✅')
        if not open_nums:
            status['offen'] = content.count('●')
        # Erste 200 Zeichen als Kurz-Summary
        status['summary'] = content[:200].strip()
        # Finde die Frage (erste Zeile nach "**Status:**" oder erste H1)
        for line in lines:
            if line.startswith('# ') and not line.startswith('# ' + 'Aktueller Stand'):
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

        # Hauptdateien
        readme_path = os.path.join(folder, 'README.md')
        index_path = os.path.join(folder, 'index.md')

        # Letzte Änderung (git log oder Datei-Mtime)
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
            # Fallback: Mtime der index.md oder README.md
            for p in [index_path, readme_path]:
                if os.path.isfile(p):
                    last_modified = int(os.path.getmtime(p))
                    break

        # Status aus README
        status = _parse_readme_status(readme_path)

        # Sub-Diskussionen (Unterordner)
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

    # Sortieren: neueste zuerst
    entries.sort(key=lambda e: e['last_modified'] or 0, reverse=True)
    return entries


# --- API-Endpoints ---

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

    return jsonify({
        'discussions': entries,
        'total': len(entries),
    })


@diskhub.route('/diskhub/<discussion_id>', methods=['GET'])
def get_discussion(discussion_id):
    """Einzelne Diskussion mit index.md + README.md Inhalt."""
    folder = os.path.join(DISCUSSIONS_DIR, discussion_id)
    if not os.path.isdir(folder):
        return jsonify({'error': 'Diskussion nicht gefunden'}), 404

    result = {'id': discussion_id, 'name': discussion_id.replace('-', ' ').title()}

    # README.md
    readme_path = os.path.join(folder, 'README.md')
    if os.path.isfile(readme_path):
        with open(readme_path, 'r') as f:
            result['readme'] = f.read()

    # index.md
    index_path = os.path.join(folder, 'index.md')
    if os.path.isfile(index_path):
        with open(index_path, 'r') as f:
            result['index'] = f.read()

    # Sub-Diskussionen
    subs = []
    for sub_name in sorted(os.listdir(folder)):
        sub_folder = os.path.join(folder, sub_name)
        if os.path.isdir(sub_folder) and not sub_name.startswith('.') and sub_name != 'assets':
            sub_index = os.path.join(sub_folder, 'index.md')
            sub_readme = os.path.join(sub_folder, 'README.md')
            sub_data = {'id': sub_name, 'name': sub_name.replace('-', ' ').title()}
            if os.path.isfile(sub_index):
                with open(sub_index, 'r') as f:
                    sub_data['index'] = f.read()
            if os.path.isfile(sub_readme):
                with open(sub_readme, 'r') as f:
                    sub_data['readme'] = f.read()
            subs.append(sub_data)
    result['subs'] = subs

    _log_activity('view', {'discussion': discussion_id})
    return jsonify(result)


@diskhub.route('/diskhub/health', methods=['GET'])
def health():
    """Health-Check."""
    return jsonify({
        'status': 'ok',
        'discussions_count': len(_scan_discussions()),
    })