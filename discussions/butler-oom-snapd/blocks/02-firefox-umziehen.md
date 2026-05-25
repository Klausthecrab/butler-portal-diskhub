### #2: Firefox umziehen — Snap zu apt
*— · 25.05.2026*

**Problem**
Firefox ist aktuell als Snap installiert. Wenn wir snapd deaktivieren wollen, muss Firefox vorher anders installiert werden — sonst ist der Browser weg.

**Zu pruefen**
- Wo speichert Snap-Firefox die Lesezeichen? (~/snap/firefox/ vs ~/.mozilla/firefox/)
- Kann Firefox via Mozilla-PPA als .deb installiert werden?
- Lesezeichen-Leiste und Passwoerter muessen erhalten bleiben
- Welche Firefox-Version (aktuell 151.0-2 via Snap)?

**Loesungsweg**
1. Mozilla-PPA hinzufuegen: sudo add-apt-repository ppa:mozillateam/ppa
2. Firefox via apt installieren
3. Lesezeichen aus Snap-Profil rueberkopieren
4. Snap-Firefox deinstallieren: sudo snap remove firefox
5. Pruefen: Lesezeichen-Leiste vorhanden?

**Status**
🔜 offen