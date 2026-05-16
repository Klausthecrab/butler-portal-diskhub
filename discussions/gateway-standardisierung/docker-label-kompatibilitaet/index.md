# Docker-Label-Kompatibilität

**Parent:** [Gateway-Strategie](../index.md)

---

### Block: Problemstellung

Schlüsselmeister läuft nativ — keine Docker-Labels. Trotzdem Traefik davor? Ja — Traefik hat duale Provider: Docker (Labels) + file (YAML).

*session: gw-20260515-docker · 16.05.2026*

### Block: Lösungsansatz

Traefik mit dualem Provider-Modell: Docker-Labels für Container-Services, file Provider (YAML) für native Services. Caddyfile-Template wäre machbar aber manuell — Traefik automatisiert.

*session: gw-20260515-docker · 16.05.2026*
