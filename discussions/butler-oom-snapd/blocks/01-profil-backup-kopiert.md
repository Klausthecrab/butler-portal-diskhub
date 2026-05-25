### #1: Profil-Backup und -Kopie
*— · 25.05.2026*

**Problem**
Bevor Firefox von Snap auf apt umgestellt wird, muss das bestehende Snap-Profil gesichert werden — sonst sind Lesezeichen, Passwörter und Sessions weg.

**Durchgeführt**
- Snap-Profil-Pfad: ~/snap/firefox/common/.mozilla/firefox/ygr0z5yf.default/
- Lesezeichen-DB: 5 MB (places.sqlite), Profil gesamt: 78 MB
- Backup erstellt: ~/ygr0z5yf.default.backup (78 MB)
- Profil kopiert nach ~/.mozilla/firefox/ygr0z5yf.default/
- profiles.ini geschrieben (zeigt auf kopiertes Profil)

**Status**
✅ erledigt