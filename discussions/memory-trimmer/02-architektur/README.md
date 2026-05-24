# Architektur: Trimmer vs. Evaluator || Zwei strikt getrennte Verantwortlichkeiten

**Erstellt:** 24.05.2026 · **Status:** 0 erledigt · 1 offen

**Kernentscheidung:** Zwei strikt getrennte Verantwortlichkeiten.

**Trimmer** — liefert Rohdaten. Resettet MEMORY.md täglich auf MEMORY_BASE.md. Output pro Lauf: review-list mit rausgefallenen §-Abschnitten. Keine Bewertung, keine Kategorisierung, kein LLM.

**Evaluator** — bewertet die Rohdaten. Liest unreviewed-Einträge aus review-list. LLM bewertet jeden Eintrag: Ja / Eventuell / Nein. Pattern Detection für wiederholte Einträge.

**Datenfluss:**
```
Trimmer-Lauf (02:00) → MEMORY.md zurücksetzen auf MEMORY_BASE.md
→ Diff: was ist rausgefallen?
→ review-list += {text, date, status: "unreviewed"}
→ Evaluator (nach Trimmer) → LLM → Ja/Eventuell/Nein + Begründung
→ Review-Tab (Portal — Max entscheidet):
  ├─ Bestätigen ✅ → schreibt Vorschlag in MEMORY_BASE.md
  ├─ Ablehnen ❌ → rejected
  └─ Zurückstellen ⏸️ → deferred
```

**Sicherheitsmechanismen:**
| Mechanismus | Beschreibung |
|---|---|
| Atomic Replace | MEMORY.md via Temp-Datei + mv — nie leer |
| Verifikation | diff nach Reset — Fehler erkannt |
| Live-Backup | Jeder Zustand archiviert |
| Kein LLM beim Reset | Reines cp — keine Halluzination |
| LLM-Isolation | Evaluator bekommt nur Diffs |
| Fallback | Bei Fehler: Live-Backup wiederherstellen |
| Puffer | MEMORY.md hat bewusst freien Platz |

> **Ergebnis:** Zwei strikt getrennte Verantwortlichkeiten ohne LLM im Reset-Pfad.
*session: spec-20260517 · 17.05.2026*