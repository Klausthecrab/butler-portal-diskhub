### #25: Textbox-Operationen: Bearbeiten + Löschen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Zwei neue Buttons pro Textbox — ✏️ Bearbeiten (schaltet in Edit-Modus mit Titel-Input + Content-Textarea + ✅ Speichern / ❌ Abbrechen) und 🗑️ Löschen (Doppelklick-Bestätigung: erster Klick zeigt "⚠️ Sicher?", zweiter Klick löscht). Backend: neue Endpoints `POST /diskhub/edit-block` und `POST /diskhub/delete-block` (block_index-basiertes Parsen/Ersetzen/Entfernen in blocks.md + Git-Commit). Beide Endpoints respektieren `is_sub`/`sub_id` für Sub-Diskussionen. Edit-Formular im Dark-Theme mit Labeln, Input-Feldern und Indigo-Save-Button. Delete mit Danger-Stil (rot). Dead Code-Entfernung: alter `convertBtn`-CSS-Duplikat. Build OK, Health-Check bestanden. API-Tests: edit-block (Titel+Content-Änderung) + delete-block (Entfernung) erfolgreich verifiziert — Formatierung korrekt (Leerzeilen zwischen Blöcken).
