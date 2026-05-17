# Gateway-Strategie: Standardisierung

**Erstellt:** 12.05.2026 · 3 Blöcke · 2 Sub-Diskussionen

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

---

→ **Sub-Diskussion:** [API-Key-Handling](api-key-handling/) ✅ erledigt

→ **Sub-Diskussion:** [Docker-Label-Kompatibilität](docker-label-kompatibilitaet/) ● offen

---

💬 **Haupt-Diskussion fortsetzen**
