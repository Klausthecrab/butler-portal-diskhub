# Blöcke — UI-Struktur

---

### ✅ TOC-Funktion implementiert

`generateToc(blocksMd, indexMd)` erzeugt einen kombinierten Mini-TOC aus beiden Dateien.
Wird zwischen README und Blocks gerendert.

### ✅ Sub-Karten vereinfacht

`.subDocBlock` zeigt nur noch: Titel + README-Auszug (200 Zeichen) + "▶ Öffnen".
Kein voller Inhalt mehr. Klick zoomt per `setActiveSubView()`.

### ✅ renderIndexMd bereinigt

TOC-Generierung entfernt — rendert nur noch Sub:-Einträge als Akkordeon.
Hot-Block-Erkennung (Rot-Akzent) bleibt erhalten.

### ○ Sub:-Akkordeon noch mit altem Block-Styling

Die Sub-Einträge in der index.md werden noch mit `renderBlock()` gerendert (Connector, Status-Badge).   
Das Styling könnte man noch cleanen — aktuell aber funktional okay.

### ○ TOC nur in Hauptansicht

TOC wird aktuell nur in der MAIN-VIEW gerendert, nicht in der Sub-View.  
Sollte das TOC auch in Sub-Diskussionen erscheinen?