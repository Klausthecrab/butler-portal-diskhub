### #4: Firefox via apt installieren
*— · 25.05.2026*

**Problem**
Firefox muss als deb installiert werden, damit er ohne Snapd läuft.

**Schritte**
1. `sudo apt install -y firefox`
2. Nach Installation: Firefox einmal manuell starten
3. Prüfen: `which firefox` → `/usr/bin/firefox`
4. Prüfen: `firefox --version` zeigt apt-Version (nicht Snap-Version 151.0-2)

**Risiken**
- Überschreibt nicht das Snap-Profil — das bleibt separat
- Falls Snap-Version noch läuft: erst beenden vor dem Start der apt-Version

**Status**
🔜 offen