### #2: Mozilla PPA hinzufügen
*— · 25.05.2026*

**Problem**
Firefox apt-Paket kommt nicht aus den Standard-Repos als neueste Version. Das Mozilla Team PPA stellt die aktuellste Firefox-Version als deb bereit.

**Schritte**
1. `sudo add-apt-repository -y ppa:mozillateam/ppa`
2. `sudo apt update`
3. Verifikation: `apt policy firefox` zeigt Quelle aus PPA

**Durchgeführt**
- `sudo add-apt-repository -y ppa:mozillateam/ppa` — erfolgreich
- `sudo apt update` — PPA wurde eingelesen
- Quelle: `https://ppa.launchpadcontent.net/mozillateam/ppa/ubuntu noble/main`

**Risiken**
- PPA ist von Mozilla selbst — vertrauenswürdig
- Kann jederzeit via `sudo add-apt-repository --remove ppa:mozillateam/ppa` rückgängig gemacht werden

**Status**
✅ erledigt