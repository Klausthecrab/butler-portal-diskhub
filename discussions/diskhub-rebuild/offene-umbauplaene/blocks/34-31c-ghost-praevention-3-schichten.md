### 31.C Ghost-Prävention — 3-Schichten-Strategie (Pre-Commit + Cron)
*— · 25.05.2026*

**Auslöser:** In Box #24 (29-24-toggle-auf-index-md...) wurden bei internen `###`-Überschriften (z.B. `### Delay-Effekt: Fix war korrekt, UI trotzdem leer`) 6 Ghost-Blöcke im UI erzeugt — obwohl Box 31.A (Backend-Auto-Convert) und 31.B (Parser-Ignore) bereits existieren.

**Erkenntnis aus der Diskussion:** Die technischen Fixes (31.A Backend, 31.B Parser) verhindern Ghosts beim Editieren via API/Portal. Aber sie greifen nicht bei Direkt-Edits via `write_file` + `git commit` (Sub-Agents, manuelle Edits). Daher braucht es zwei zusätzliche Schutzschichten auf *organisatorischer* Ebene.

---

## Schicht 1 — Backend (bestehend, Box 31.A)

Der Bouncer: Beim Speichern via API (`/edit-block`, `/add-box`) wandelt das Backend interne `###` automatisch in `##` um.

**Greift bei:** ✏️-Edit im Portal, ✅-Toggle, Neue Box via Portal

**Status:** ✅ Implementiert (Box 31.A)

---

## Schicht 2 — Pre-Commit-Hook

Der Türsteher: Ein Git-Hook prüft vor jedem Commit, ob geänderte `blocks/*.md`-Dateien mehr als ein `###` haben.

**Script-Entwurf:**

```bash
#!/bin/bash
# Pre-Commit-Hook: DiskHub Textbox ###-Checker
# Ort: ~/repos/butler-portal-diskhub/.git/hooks/pre-commit

repo_root=$(git rev-parse --show-toplevel)
fail=0

while IFS= read -r file; do
  [[ "$file" != blocks/*.md ]] && continue
  filepath="$repo_root/$file"
  [ ! -f "$filepath" ] && continue
  count=$(grep -c "^### " "$filepath" 2>/dev/null || echo 0)
  if [ "$count" -gt 1 ]; then
    echo "❌ $file: $count ### (max 1 erlaubt). Zeilen:"
    grep -n "^### " "$filepath"
    echo ""
    fail=1
  fi
done < <(git diff --cached --name-only)

exit $fail
```

**Installation:**
```bash
chmod +x ~/repos/butler-portal-diskhub/.git/hooks/pre-commit
```

**Verhalten:** Nur wenn eine `blocks/*.md`-Datei im Commit ist UND mehr als 1 `###` hat → Commit-Abbruch mit Auflistung der fehlerhaften Zeilen. Sonst keine Wirkung.

**Offen:**
- Hook muss bei frischen Clones manuell aktiviert werden (Git klont Hooks nicht mit)
- Option: `.githooks/pre-commit` ins Repo legen + `git config core.hooksPath .githooks` dokumentieren

---

## Schicht 3 — Cron-Scan (Periodische Überwachung)

Der Putzdienst: Ein wöchentlicher Cron-Job scannt alle `blocks/*.md`-Dateien auf mehrfache `###` und meldet Funde per Telegram.

**Cron-Job-Entwurf (via cronjob-Tool):**

```bash
# Alle 7 Tage: Prüfe blocks/*.md auf Ghost-Risiko
find ~/repos/butler-portal-diskhub/discussions/*/offene-umbauplaene/blocks/ -name '*.md' \
  -exec sh -c 'c=$(grep -c "^### " "$1"); [ "$c" -gt 1 ] && echo "$1: $c ###"' _ {} \;
```

**Ausgabe (Telegram):**
```
⚠️ Ghost-Block-Prüfung (25.05.2026)
❌ blocks/29-24-toggle-auf-index-md.md: 7 ###
→ Interne ### in Zeilen 167, 172, 177, 204, 212, 230
```

**Verhalten:** Nur melden, nicht automatisch fixen. Du entscheidest ob und wann korrigiert wird.

---

## Zusammenspiel — Wer fängt was?

| Situation | Schutzschicht |
|-----------|--------------|
| ✏️-Edit / ✅-Toggle im Portal | 1 (Backend Auto-Convert, 31.A) |
| Neue Box via Portal-API | 1 (Backend Auto-Convert, 31.A) |
| Sub-Agent per `write_file` + `git commit` | 2 (Pre-Commit-Hook) |
| Manuelles Edit + `git commit` | 2 (Pre-Commit-Hook) |
| Alte Datei aus Backup wiederhergestellt | 3 (Cron-Scan meldet) |
| Nachbesserung von bestehenden Ghosts | Manuell (Box 31.B + Pre-Commit-Hook verhindert Neuentstehung) |

---

## Abgrenzung zu Box 31.A und 31.B

- **31.A** (Backend-Auto-Convert): Fix auf API-Ebene — wandelt interne `###` beim Speichern um
- **31.B** (Parser-Ignore): Fix auf Frontend-Ebene — Parser ignoriert interne `###` im Einzeldateien-Modus
- **31.C** (diese Box): Organisatorische Absicherung — verhindert dass Ghosts überhaupt auf die Platte kommen (Pre-Commit) und warnt wenn doch (Cron)