### #2: Firefox umziehen — Snap zu apt
*— · 25.05.2026*

**Problem**
Firefox ist aktuell als Snap installiert. Wenn wir snapd deaktivieren wollen, muss Firefox vorher anders installiert werden — sonst ist der Browser weg.

**Befunde (bereits analysiert)**
- Snap-Profil-Pfad: ~/snap/firefox/common/.mozilla/firefox/ygr0z5yf.default/
- Lesezeichen-DB: 5 MB (places.sqlite), Profil gesamt: 78 MB
- Aktuelle Version: 151.0-2 via Snap
- Mozilla-PPA ist verfuegbar: ppa:mozillateam/ppa

**Bereits erledigt (ohne sudo)**
- ✅ Backup erstellt: ~/ygr0z5yf.default.backup (78 MB)
- ✅ Profil kopiert nach ~/.mozilla/firefox/ygr0z5yf.default/
- ✅ profiles.ini geschrieben (zeigt auf kopiertes Profil)

**Noch offen (braucht sudo-Passwort)**
1. PPA hinzufuegen: `sudo add-apt-repository -y ppa:mozillateam/ppa`
2. Apt-Preference setzen (Firefox deb vor Snap priorisieren):
   `echo 'Package: *\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 1001' | sudo tee /etc/apt/preferences.d/mozilla-firefox`
3. Firefox installieren: `sudo apt install -y firefox`
4. Snap-Firefox entfernen: `sudo snap remove firefox`

**Verifikation (nach Installation)**
- Firefox starten → Lesezeichen-Leiste sichtbar?
- Profil-Pfad: about:profiles zeigt ~/.mozilla/firefox/ygr0z5yf.default/?
- Eingeloggt in Mozilla-Account?
- snap list → firefox nicht mehr gelistet
- losetup -a → weniger loop-devices

**Risiken**
- Sollte etwas schiefgehen: Backup liegt unter ~/ygr0z5yf.default.backup
- Firefox kann auch ohne PPA via .tar.gz von mozilla.org installiert werden

**Status**
🔜 offen — naechster Schritt: sudo-Passwort fuer PPA + Installation