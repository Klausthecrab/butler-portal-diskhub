### OOM-Daemon installieren — earlyoom oder systemd-oomd

*— · 27.05.2026*

**Problem**

Der Kernel-OOM-Killer greift erst wenn der Swap komplett voll ist — dann killt er zufällig. Auf Butler hat er `hermes-gateway` erwischt, was erstmal das Dashboard lahmgelegt hat. Ein smarter OOM-Daemon könnte gezielt den richtigen Prozess killen oder früher eingreifen.

**Lösung**

`earlyoom` installieren — leichtgewichtig, pollt RAM/Swap und killt Prozesse mit niedriger `oom_score` bevor der Kernel eingreifen muss. Alternativ `systemd-oomd` (nutzt PSI, feiner geregelt, aber systemd-lastig).

**Mögliche Konfiguration (earlyoom)**

```bash
sudo apt install earlyoom
# Config: earlyoom greift bei >90% RAM + >80% Swap ein
sudo systemctl edit earlyoom
# → EARLYOOM_ARGS="-r 420 -m 10 -s 80 -M 512000"
```

**Offene Frage**

- earlyoom vs systemd-oomd? earlyoom ist einfacher, systemd-oomd ist präziser (PSI-basiert)
- Welche Prozesse sollen priorisiert gekillt werden? (Browser-Tabs zuerst, dann Snap-Prozesse, dann Gateway?)
- Soll früher eingegriffen werden (bei 80% Swap) oder erst bei 95%?

**Status**

🔜 offen