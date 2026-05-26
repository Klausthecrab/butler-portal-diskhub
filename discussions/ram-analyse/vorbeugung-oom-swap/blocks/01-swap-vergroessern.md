### Swap vergrößern — von 8GB auf 16GB

*— · 27.05.2026*

**Problem**

Butler hat nur 8GB Swap bei 31GB RAM. In der Nacht war der Swap 100% voll — das hat den OOM-Killer getriggert. Mehr Swap-Puffer gibt dem System Luft, bevor der OOM zuschlägt.

**Lösung**

Swap-Datei von 8GB auf 16GB vergrößern. Da aktuell 256MB belegt sind, reicht das für die meisten Lastspitzen.

**Umsetzung**

```bash
sudo swapoff /swap.img
sudo fallocate -l 16G /swap.img
sudo chmod 600 /swap.img
sudo mkswap /swap.img
sudo swapon /swap.img
```

**Verifikation**

```bash
swapon --show  # → Soll 16G zeigen
free -h        # → Swap: total 16G
```

**Status**

🔜 offen