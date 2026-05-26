### Ursachenanalyse — wer hat den Swap gefüllt?

*— · 27.05.2026*

**Problem**

Um 01:00 war der gesamte 8GB Swap belegt — aber wer hat ihn gefüllt? Der OOM-Killer hat `hermes-gateway` (PID 198431, 333MB RSS) gekillt, aber das allein erklärt nicht 8GB Swap. Es könnte sein:
- Ein anderer Prozess hat vorher Swap gefressen und wurde schon gekillt
- Mehrere Prozesse haben parallel RAM gezogen
- Der OOM-Killer-Eintrag im Journal ist nicht der erste

**Lösung**

SAR-Daten genauer auswerten — sysstat hat 10-Minuten-Intervalle, reicht aber für grobe Analyse:
- `sar -r -s 00:00 -e 02:00` zeigt RAM-Verlauf über die kritische Stunde
- `sar -S -s 00:00 -e 02:00` zeigt Swap-Verlauf
- `journalctl --list-boots` zeigt ob es ältere OOM-Events gab
- `ps_mem` oder `smem` installieren für prozessgenaue RAM-Analyse

**Nächste Schritte**

1. SAR-Daten für die letzte Woche abrufen — wiederholt sich das Muster?
2. `smem -t -p` einmalig ausführen um zu sehen welcher Prozess aktuell wie viel RAM frisst
3. Gateway-Usage über 24h tracken: `systemd-cgtop` oder `ps aux --sort=-%mem`

**Status**

🔜 offen