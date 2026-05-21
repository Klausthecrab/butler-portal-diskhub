# DiskHub – Butler Portal

Markdown-Diskussionen in Git. Portal auf dem Butler Dashboard (Port 8090, /diskhub).

## Struktur

```
frontend/              → Page.jsx + Page.module.css (via Symlink in Dashboard)
backend/routes.py      → Flask-API
discussions/           → Markdown-Diskussionen + Planungsdokumente
```

## Stand

Siehe `discussions/diskhub-rebuild/offene-umbauplaene/index.md` für aktuelle und geplante Änderungen.

## Entwicklung

1. Änderungen in `frontend/Page.jsx` / `frontend/Page.module.css`
2. Build: `cd ~/repos/butler-dashboard-v3/frontend && npm run build`
3. Restart: `kill $(lsof -ti:8090); cd ~/repos/butler-dashboard-v3/backend && /usr/bin/python3 server.py &`
4. Commit: `git add -A && git commit -m "disc: <id>: <msg>"`