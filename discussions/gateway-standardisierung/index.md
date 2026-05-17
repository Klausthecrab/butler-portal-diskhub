# Gateway-Strategie: Standardisierung

**Erstellt:** 12.05.2026 · 5 Blöcke · 2 Sub-Diskussionen

---

### Sub: Einheitlicher Reverse-Proxy? || Einheitlicher Reverse-Proxy eingesetzt

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Sub: Wie handhaben wir API-Keys? || API-Key-Handling geklärt

Gateway routet nur. API-Key-Validierung bleibt beim Schlüsselmeister. Schlüsselmeister bekommt vorgelagerten Auth-Check-Endpoint.

> **Ergebnis:** API-Key-Validierung bleibt beim Schlüsselmeister. Gateway übernimmt reines Routing.

*session: gw-sub-auth-20260513 · 15.05.2026*

### Sub: Traefik-Entscheidung || Traefik als Gateway gewählt

*session: gw-20260512-a3f2 · Übernommen 13.05.2026*

### Sub: Wie integrieren wir Docker-Label-Kompatibilität?

Schlüsselmeister läuft nativ — wie registriert er sich bei Traefik? Lösung: file Provider mit YAML-Konfiguration. Einmalig schreiben, Integration klären.

*session: gw-sub-docker-20260515 · offen*

### Sub: Valider Test-Eintrag?

*session: test-20260517 · 17.05.2026*

### Sub: Notiz — Platzhalter

Dies ist ein Platzhalter für Parent-Kind-Visualisierung.

*session: demo · 17.05.2026*

---

💬 **Haupt-Diskussion fortsetzen**