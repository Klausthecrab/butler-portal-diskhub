# Blöcke — Datei-Struktur

---

### ✅ blocks.md implementiert

Backend liefert `blocks`-Feld in der API-Response.  
Frontend rendert "Blöcke"-Sektion zwischen README und index.md.  
`adopt-block` schreibt in `blocks.md` statt `index.md`.  
Session-Kontext-Prompt hat Fallback index.md → blocks.md.

### ○ meta.json noch offen

Soll Metadaten aus dem README-Header in eine eigene JSON-Datei auslagern?  
Oder reichen die Header-Felder in `README.md`? Entscheidung bei Punkt 2 (UI-Struktur).

### ○ Migration bestehender Diskussionen

Alle `### Sub:`-Einträge bleiben in `index.md`.  
Blöcke wandern in neue `blocks.md` — aktuell nur bei `01-datei-struktur` als Test.

### ○ Sub-Karten noch mit index.md

In der Hauptansicht werden Sub-Karten unterhalb der Diskussion noch mit `sub.index` + `sub.readme` + `sub.blocks` dargestellt — das ist für die Detail-Ansicht (Punkt 3) noch zu vereinfachen.