### #36: STRG+V aus Zwischenablage (Screenshots) in Diskussionen

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Möglichkeit per STRG+V ein Bild aus der Zwischenablage (z.B. Screenshot) in eine Diskussion einzufügen.
>
> ⚠️ **Bereits in #28 F.02 implementiert** — `onPaste`-Handler auf der Textarea in `addBoxSection` erkennt Clipboard-Bilder und speichert sie als `pendingImage`. Das Bild wird beim nächsten "Box hinzufügen" mit hochgeladen.
>
> **Offen:** Soll STRG+V auch außerhalb der `addBoxSection` funktionieren? Z.B. direkt in eine Sub-Diskussion oder als eigenständigen Bild-Block ohne Textbox? Oder ist der aktuelle Flow (Textbox mit Bild) ausreichend?
