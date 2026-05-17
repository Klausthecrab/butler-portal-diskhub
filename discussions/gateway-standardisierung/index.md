# Gateway-Strategie: Standardisierung

**Erstellt:** 12.05.2026 · 4 konsolidierte Blöcke · 2 Sub-Diskussionen

---

### Sollen wir einen einheitlichen Reverse-Proxy setzen?

Einheitlicher Reverse-Proxy für alle externen API-Calls. Aktuell: n8n, Hermes, changedetection, Schlüsselmeister — jedes mit eigenem Routing. Ziel: ein zentraler Entrypoint.

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Sollten wir uns für Traefik entscheiden?

Entscheidung für **Traefik** als zentralen Gateway. Docker-Label-Discovery für Container, file Provider (YAML) für native Services. Auto-Let's-Encrypt, zentrale Metriken, skalierbar.

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Ist dies ein valider Test-Eintrag?

Dies ist ein Test-Eintrag über Hermes CLI.

*session: test-20260517 · 17.05.2026*

### Sub: Wie handhaben wir API-Keys?

Gateway routet nur. API-Key-Validierung bleibt beim Schlüsselmeister. Schlüsselmeister bekommt vorgelagerten Auth-Check-Endpoint.

> **Ergebnis:** API-Key-Validierung bleibt beim Schlüsselmeister. Gateway übernimmt reines Routing.

*session: gw-sub-auth-20260513 · 15.05.2026*

### Sub: Wie integrieren wir Docker-Label-Kompatibilität?

Schlüsselmeister läuft nativ — wie registriert er sich bei Traefik? Lösung: file Provider mit YAML-Konfiguration. Einmalig schreiben, Integration klären.

*session: gw-sub-docker-20260515 · offen*

---

💬 **Haupt-Diskussion fortsetzen**
