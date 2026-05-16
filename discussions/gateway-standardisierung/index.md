# Gateway-Strategie: Standardisierung

**Erstellt:** 12.05.2026 · 4 konsolidierte Blöcke · 2 Sub-Diskussionen

---

### Block: Einheitlicher Reverse-Proxy

Einheitlicher Reverse-Proxy für alle externen API-Calls. Aktuell: n8n, Hermes, changedetection, Schlüsselmeister — jedes mit eigenem Routing. Ziel: ein zentraler Entrypoint.

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Block: Entscheidung für Traefik

Entscheidung für **Traefik** als zentralen Gateway. Docker-Label-Discovery für Container, file Provider (YAML) für native Services. Auto-Let's-Encrypt, zentrale Metriken, skalierbar.

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Sub: API-Key-Handling (✓ erledigt)

Gateway routet nur. API-Key-Validierung bleibt beim Schlüsselmeister. Schlüsselmeister bekommt vorgelagerten Auth-Check-Endpoint.

*session: gw-sub-auth-20260513 · 15.05.2026*

### Sub: Docker-Label-Kompatibilität (● offen)

Schlüsselmeister läuft nativ — wie registriert er sich bei Traefik? Lösung: file Provider mit YAML-Konfiguration. Einmalig schreiben, Integration klären.

*session: gw-sub-docker-20260515 · offen*

---

💬 **Haupt-Diskussion fortsetzen**
