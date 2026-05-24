### Memtest86+ durchführen

*— · 25.05.2026*

Butler über Nacht rebooten lassen und Memtest86+ laufen lassen.

▌Ziel:
RAM auf Defekte prüfen — Memtest läuft ~1-2h und scannt jeden Bit mehrfach.

▌Aufgaben:
- `sudo apt install memtest86+` — Installation (falls nicht vorhanden)
- Boot-Eintrag via `sudo update-grub` aktivieren
- Beim nächsten Neustart Memtest86+ im GRUB-Menü auswählen
- Test komplett durchlaufen lassen (mindestens 1 Pass)
- Butler bootet danach normal weiter — alle Dienste starten automatisch

▌Mögliche Ergebnisse:
- **Rote Fehler/Balken** → RAM-Riegel defekt. Kontaktprobleme prüfen (raus/neu reinstecken) oder Riegel tauschen
- **Keine Fehler** → Single-Bit-Flip durch Strahlung oder seltener Kernel-Bug. Kein Handlungsbedarf, einmalig

### kernel.panic=10 setzen

*— · 25.05.2026*

Aktuell ist `kernel.panic=0` — bei einem Kernel-Crash bleibt der Bildschirm schwarz und das System hängt. Mit `kernel.panic=10` rebootet die Kiste automatisch nach 10 Sekunden.

▌Umsetzung:
```bash
echo "kernel.panic=10" | sudo tee /etc/sysctl.d/99-panic.conf
sudo sysctl -p /etc/sysctl.d/99-panic.conf
```

▌Verifikation:
```bash
cat /proc/sys/kernel/panic
# → Soll "10" zeigen
```

### RAM-Analyse nach Memtest auswerten

*— · 25.05.2026*

Nachdem Memtest durchgelaufen ist: Ergebnisse dokumentieren und Entscheidung treffen.

▌Zu prüfen:
- Anzahl der gefundenen Fehler (0 = gut, >0 = RAM-Tausch nötig)
- Welcher Riegel/Slot hat gefehlt (falls Memtest das anzeigt)
- Ob der Butler seitdem stabil läuft (Beobachtungszeitraum 1 Woche)
