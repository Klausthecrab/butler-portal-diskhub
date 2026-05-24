### Ursachenanalyse (✓ erledigt)
*— · 25.05.2026*
*Erledigt: 25.05.2026*

Kernel-Logs vom vorherigen Boot zeigen:

- `asm_exc_page_fault` + `do_user_addr_fault` — Page Fault im Userspace
- `Code: Unable to access opcode bytes at 0x73f16f92aed6` — Kernel konnte Code an Adresse nicht lesen
- `kernel.panic=0` → System blieb hängen statt zu rebooten
- 12.4GB shmem (Docker), 28GB frei, Swap leer → kein OOM
- Nach 2 Monaten Uptime — RAM degradiert über Zeit oder Single-Bit-Flip

**Ergebnis:** Software-Auslöser ausgeschlossen. Fokus auf Hardware (RAM).

### Hintergrundinfos
*— · 25.05.2026*

- **CPU:** 13th Gen Intel(R) Core(TM) i5-13400F
- **GPU:** AMD/ATI Navi 22 [Radeon RX 6700 XT] (kein Intel Arc)
- **RAM:** 31GB (davon 28GB frei zum Zeitpunkt des Freezes)
- **Kernel:** 6.8.0-117-generic (von März 2026)
- **Uptime vor Freeze:** 2 Monate+ (letzter Reboot März 2026)
- **Temperaturen:** 16-40°C (normal)

─────────────────────

Ursache geklärt. Nächster Schritt: Memtest86+.
