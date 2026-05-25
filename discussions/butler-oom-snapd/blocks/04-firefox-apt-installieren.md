### #4: Firefox via apt installieren
*— · 25.05.2026*

**Problem**
Firefox muss als deb installiert werden, damit er ohne Snapd läuft.

**Schritte**
1. `sudo apt install -y firefox`
2. Nach Installation: Firefox einmal manuell starten
3. Prüfen: `which firefox` → `/usr/bin/firefox`
4. Prüfen: `firefox --version` zeigt apt-Version (nicht Snap-Version 151.0-2)

**Durchgeführt**
- `sudo apt install -y --allow-downgrades firefox` (PPA-Version 151.0.1 ist älter als Snap-Wrapper → Downgrade nötig)
- Ergebnis: Firefox 151.0.1 via apt installiert
- `which firefox` → `/usr/bin/firefox`
- `firefox --version` → `Mozilla Firefox 151.0.1`
- Snap-Wrapper-Paket `1:1snap1-0ubuntu5` wurde durch deb-Version ersetzt
- Lesezeichen von Kazzle bestätigt: Daten übertragen

**Risiken**
- Überschreibt nicht das Snap-Profil — das bleibt separat
- Falls Snap-Version noch läuft: erst beenden vor dem Start der apt-Version

**Status**
✅ erledigt