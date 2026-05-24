# Implementierung

**Sub-Diskussion von:** memory-trimmer  
**Status:** ✅ Portal v1.1 live (24.05.2026)

---

## Meilensteine

| Phase | Inhalt | Status |
|-------|--------|--------|
| Phase 1 | Session-Temp-Memory (Konzept) | ✅ Ersetzt |
| Phase 2 | Nightly Deterministic Trimmer (Cron) | ✅ Ersetzt |
| Phase 3 | Session-Temp-Evaluation | ✅ Ersetzt |
| Portal v1 | 4 Tabs + Kill-Switch + Registry | ✅ Live |
| v1.1–v1.9 | 12 Feature-Releases | ✅ Live |

## Portal-Repo

**Ort:** `~/repos/butler-portal-memory-trimmer/`
**Backend:** `backend/routes.py` — 7 Endpoints (status, memory-base, user-base, graveyard, section-analysis, log-stream, comments)
**Frontend:** `frontend/Page.jsx` + Komponenten (BausteinCard)

## Cron-Setup

- `run_memory_trimmer.sh` → Trimmer + Evaluator + Review-Evaluator
- täglich 02:00 via n8n
- Logs in `~/data/projects/memory-trimmer/logs/`
- n8n-Workflow registered in butler-registry

## Legacy: Alter Evaluator

- `run_evaluator.py` — ⛔ deprecated, liegt als Fallback
- Ersetzt durch Review-Evaluator (`run_review_evaluator.py`)
