#!/usr/bin/env python3
"""
Phase 3 — Migration: Sammeldateien in Einzeldateien aufsplitten (#H).

Liest blocks.md + index.md, zerlegt sie in Einzeldateien unter blocks/ und index/,
löscht die Sammeldateien (via trash) nach Erfolg.

Usage:
  python3 scripts/split-collection-files.py <discussions-dir> [--dry-run]

Example:
  cd ~/repos/butler-portal-diskhub
  python3 scripts/split-collection-files.py discussions/diskhub-rebuild/offene-umbauplaene
  python3 scripts/split-collection-files.py discussions/diskhub-rebuild/offene-umbauplaene --dry-run
"""

import os
import re
import sys
import shutil
import subprocess
from datetime import datetime

DISCUSSIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'discussions')
TRASH_DIR = os.path.expanduser('~/.local/share/Trash/files')

def slugify(title: str, max_len: int = 40) -> str:
    """Erzeugt Dateinamen-Slug aus Heading-Titel."""
    slug = re.sub(r'[^a-z0-9-]', '-', title.lower())
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:max_len]

def find_nn_slug_path(blocks_dir: str, nn: str, slug: str, counter: int = 0) -> str:
    """Finde kollisionsfreien Dateinamen."""
    suffix = f'-{counter}' if counter > 0 else ''
    fname = f'{nn}-{slug}{suffix}.md'
    fpath = os.path.join(blocks_dir, fname)
    if not os.path.exists(fpath):
        return fpath, fname.replace('.md', '')
    return find_nn_slug_path(blocks_dir, nn, slug, counter + 1)

def split_collection_file(collection_path: str, target_dir: str, label: str, dry_run: bool = False) -> list:
    """
    Zerlegt eine Sammeldatei (blocks.md oder index.md) in Einzeldateien.
    
    Returns: Liste der erstellten Dateinamen (ohne .md).
    """
    if not os.path.isfile(collection_path):
        print(f"  ⏭️  {label}: {collection_path} nicht gefunden, überspringe")
        return []
    
    print(f"\n  📄 {label}: {collection_path}")
    
    with open(collection_path, 'r') as f:
        lines = f.readlines()
    
    # Alle ###-Header und ihre Positionen finden
    header_indices = [(i, line) for i, line in enumerate(lines) if line.startswith('### ')]
    
    if not header_indices:
        print(f"  ⚠️  Keine ###-Header in {collection_path} gefunden")
        return []
    
    print(f"  🔍 {len(header_indices)} Einträge gefunden")
    
    # Ziel-Ordner erstellen
    if not dry_run:
        os.makedirs(target_dir, exist_ok=True)
    
    created_files = []
    
    for idx, (start, header_line) in enumerate(header_indices):
        # Block-Ende bestimmen (nächster ### oder Ende der Datei)
        if idx + 1 < len(header_indices):
            end = header_indices[idx + 1][0]
        else:
            end = len(lines)
        
        heading_text = header_line[4:].strip()  # "### " entfernen
        
        # NN = Position in der Datei (00-based)
        nn = f'{idx:02d}'
        
        # Slug aus Heading generieren
        # Bei #XX: prefix: "### #A: Semantik-Regeln" → slug enthält "a-semantik-regeln" 
        # Bei normalen Titeln: "### Textbox" → "textbox"
        slug = slugify(heading_text)
        
        # Falls leer: Fallback
        if not slug:
            slug = f'eintrag-{idx}'
        
        # Kollisionsfreien Pfad finden
        filepath, file_name = find_nn_slug_path(target_dir, nn, slug)
        
        # Block-Inhalt extrahieren (inklusiver ### Header)
        block_content = ''.join(lines[start:end]).rstrip('\n') + '\n'
        
        print(f"    {nn} → {os.path.basename(filepath)}  ({heading_text[:50]})")
        
        if not dry_run:
            with open(filepath, 'w') as f:
                f.write(block_content)
        
        created_files.append(file_name)
    
    return created_files

def trash_file(path: str, dry_run: bool = False) -> bool:
    """Verschiebt eine Datei in den Trash."""
    if not os.path.isfile(path):
        return False
    
    if dry_run:
        print(f"    (dry-run) → trash: {path}")
        return True
    
    # trash-cli oder manuelle Trash-Verschiebung
    try:
        result = subprocess.run(['trash', path], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"    ✅ getrasht: {path}")
            return True
        else:
            print(f"    ⚠️  trash fehlgeschlagen: {result.stderr.strip()}")
            return False
    except FileNotFoundError:
        # Fallback: Manuelle Trash-Verschiebung
        os.makedirs(TRASH_DIR, exist_ok=True)
        trash_path = os.path.join(TRASH_DIR, os.path.basename(path))
        counter = 0
        while os.path.exists(trash_path):
            counter += 1
            base, ext = os.path.splitext(os.path.basename(path))
            trash_path = os.path.join(TRASH_DIR, f'{base}_{counter}{ext}')
        shutil.move(path, trash_path)
        print(f"    ✅ manuell getrasht: {path} → {trash_path}")
        return True

def process_discussion(disc_dir: str, dry_run: bool = False) -> dict:
    """Verarbeitet eine Diskussion: splittet blocks.md + index.md."""
    result = {
        'path': disc_dir,
        'name': os.path.basename(disc_dir),
        'blocks_created': [],
        'index_created': [],
        'blocks_trashed': False,
        'index_trashed': False,
    }
    
    print(f"\n{'='*60}")
    print(f"📁 Diskussion: {os.path.basename(disc_dir)}")
    print(f"{'='*60}")
    
    # blocks.md → blocks/
    blocks_md = os.path.join(disc_dir, 'blocks.md')
    blocks_dir = os.path.join(disc_dir, 'blocks')
    
    if os.path.isfile(blocks_md):
        files = split_collection_file(blocks_md, blocks_dir, 'blocks.md', dry_run)
        result['blocks_created'] = files
        
        if files and not dry_run:
            trash_file(blocks_md, dry_run)
            result['blocks_trashed'] = True
    
    # index.md → index/
    index_md = os.path.join(disc_dir, 'index.md')
    index_dir = os.path.join(disc_dir, 'index')
    
    if os.path.isfile(index_md):
        files = split_collection_file(index_md, index_dir, 'index.md', dry_run)
        result['index_created'] = files
        
        if files and not dry_run:
            trash_file(index_md, dry_run)
            result['index_trashed'] = True
    
    return result

def process_recursive(base_dir: str, dry_run: bool = False) -> list:
    """Verarbeitet Haupt-Diskussion + alle Sub-Diskussionen."""
    results = []
    
    # Haupt-Diskussion
    if os.path.isdir(base_dir):
        results.append(process_discussion(base_dir, dry_run))
    
    # Sub-Diskussionen (Ordner mit README.md oder index.md)
    for item in sorted(os.listdir(base_dir)):
        item_path = os.path.join(base_dir, item)
        if not os.path.isdir(item_path) or item.startswith('.') or item in ('assets', 'blocks', 'index', 'scripts'):
            continue
        
        # Prüfen ob es eine Sub-Diskussion ist (hat README.md oder index.md)
        has_readme = os.path.isfile(os.path.join(item_path, 'README.md'))
        has_index = os.path.isfile(os.path.join(item_path, 'index.md'))
        has_blocks = os.path.isfile(os.path.join(item_path, 'blocks.md'))
        
        if has_readme or has_index or has_blocks:
            results.append(process_discussion(item_path, dry_run))

    return results

def verify_migration(disc_dir: str) -> dict:
    """Verifiziert die Migration: Prüft ob blocks.md + index.md weg sind und Einzeldateien existieren."""
    result = {'status': 'ok', 'checks': []}
    
    # Prüfen: blocks.md weg?
    blocks_md = os.path.join(disc_dir, 'blocks.md')
    blocks_dir = os.path.join(disc_dir, 'blocks')
    blocks_ok = not os.path.isfile(blocks_md) and os.path.isdir(blocks_dir)
    result['checks'].append({
        'check': 'blocks.md gelöscht, blocks/ existiert',
        'status': '✅' if blocks_ok else '❌',
    })
    if not blocks_ok:
        result['status'] = 'fail'
    
    # Prüfen: index.md weg?
    index_md = os.path.join(disc_dir, 'index.md')
    index_dir = os.path.join(disc_dir, 'index')
    index_ok = not os.path.isfile(index_md) and os.path.isdir(index_dir)
    result['checks'].append({
        'check': 'index.md gelöscht, index/ existiert',
        'status': '✅' if index_ok else '❌',
    })
    if not index_ok:
        result['status'] = 'fail'
    
    # Prüfen: Einzeldateien vorhanden?
    if os.path.isdir(blocks_dir):
        block_files = sorted([f for f in os.listdir(blocks_dir) if f.endswith('.md')])
        result['checks'].append({
            'check': f'blocks/: {len(block_files)} Dateien ({", ".join(b[:3] for b in block_files[:5])}...)',
            'status': '✅' if block_files else '⚠️  leer',
        })
        # Prüfen NN-Format
        nn_ok = all(re.match(r'^\d{2}-', f) for f in block_files)
        result['checks'].append({
            'check': 'Dateinamen: NN-Format (00-xx, 01-xx)',
            'status': '✅' if nn_ok else '❌',
        })
        if not nn_ok:
            result['status'] = 'fail'
    
    if os.path.isdir(index_dir):
        index_files = sorted([f for f in os.listdir(index_dir) if f.endswith('.md')])
        result['checks'].append({
            'check': f'index/: {len(index_files)} Dateien',
            'status': '✅' if index_files else '⚠️  leer',
        })
    
    return result

def main():
    dry_run = '--dry-run' in sys.argv
    
    # Ziel-Diskussionen
    targets = []
    for arg in sys.argv[1:]:
        if arg.startswith('--'):
            continue
        path = os.path.abspath(arg) if os.path.isabs(arg) or arg.startswith('~') else os.path.join(os.getcwd(), arg)
        if os.path.isdir(path):
            targets.append(path)
        else:
            print(f"❌ Pfad nicht gefunden: {arg} → {path}")
    
    if not targets:
        print("Usage: python3 scripts/split-collection-files.py <discussions-dir> [--dry-run]")
        print("  Beispiel: python3 scripts/split-collection-files.py discussions/diskhub-rebuild/offene-umbauplaene")
        sys.exit(1)
    
    print(f"{'='*60}")
    print(f"📂 DiskHub — Phase 3: Sammeldateien → Einzeldateien")
    print(f"{'='*60}")
    if dry_run:
        print(f"⚠️  DRY RUN — Es werden keine Dateien verändert")
    
    all_results = []
    for target in targets:
        results = process_recursive(target, dry_run)
        all_results.extend(results)
    
    # Zusammenfassung
    print(f"\n{'='*60}")
    print(f"📊 Zusammenfassung")
    print(f"{'='*60}")
    
    total_blocks = sum(len(r['blocks_created']) for r in all_results)
    total_index = sum(len(r['index_created']) for r in all_results)
    total_trashed = sum(1 for r in all_results if r['blocks_trashed'] or r['index_trashed'])
    
    print(f"  Diskussionen verarbeitet: {len(all_results)}")
    print(f"  Textbox-Dateien erstellt: {total_blocks}")
    print(f"  Index-Dateien erstellt:   {total_index}")
    print(f"  Sammeldateien getrasht:   {total_trashed}")
    
    if not dry_run:
        print(f"\n{'='*60}")
        print(f"🔍 Verifikation")
        print(f"{'='*60}")
        for r in all_results:
            v = verify_migration(r['path'])
            status = '✅' if v['status'] == 'ok' else '❌'
            print(f"\n  {status} {r['name']}:")
            for c in v['checks']:
                print(f"    {c['status']} {c['check']}")

if __name__ == '__main__':
    main()