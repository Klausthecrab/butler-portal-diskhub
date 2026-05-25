### #3: Apt-Preference setzen
*— · 25.05.2026*

**Problem**
Ohne Preference bevorzugt apt ggf. die Snap-Version oder ignoriert das PPA. Wir müssen Firefox deb vor anderen Quellen priorisieren.

**Schritte**
1. Preference-Datei anlegen:
   ```
   echo 'Package: *\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 1001' | sudo tee /etc/apt/preferences.d/mozilla-firefox
   ```
2. Verifikation: `apt policy firefox` zeigt Priority 1001

**Risiken**
- Falsche Preference kann andere Pakete blockieren — hier nur auf Mozilla-PPA begrenzt
- Rückgängig: `sudo rm /etc/apt/preferences.d/mozilla-firefox`

**Status**
🔜 offen