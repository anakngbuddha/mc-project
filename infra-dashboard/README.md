# Personal Infra Dashboard — Local-only phase

No Docker, no Postgres, no CCE yet. Everything runs directly with
`node`, `go run`, and `uvicorn` on your machine, in separate terminals.

## What's different from the full design right now

- **history-service** uses **SQLite** (a local file, `dev.db`) instead of
  Postgres via Prisma. Swapping to Postgres later is a one-line change
  in `prisma/schema.prisma` (`provider = "postgresql"`) plus a real
  `DATABASE_URL`.
- **No Redis.** `collector-service` calls `history-service` and
  `alert-service` directly over HTTP instead of publishing to a message
  bus. This is simpler for local dev; introducing Redis pub/sub later
  (when Docker/CCE come in) is an architecture upgrade, not a rewrite —
  collector-service would publish once, and both services would
  subscribe instead of being called directly.
- **collector-service runs in mock mode.** It generates synthetic
  CPU/memory metrics for 3 fake resources every 10s instead of calling
  real Huawei Cloud / Azure APIs. This lets you build and test the full
  pipeline before wiring up real cloud credentials.
- **alert-service state is in-memory.** Rules and alerts reset when the
  service restarts. Fine for local dev; give it real persistence later.

## Run order

Open 5 terminals (VS Code's split terminal works well for this).

### 1. history-service

```bash
cd services/history-service
npm install
npm run prisma:generate
npm run prisma:migrate    # creates dev.db and the Metric table
npm run dev                # http://localhost:4000
```

### 2. notifier

```bash
cd services/notifier
npm install
npm run dev                # http://localhost:5050
```

### 3. alert-service

```bash
cd services/alert-service
python -m venv venv
source venv/Scripts/activate   # Git Bash on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

### 4. collector-service

```bash
cd services/collector-service
go run main.go              # starts posting mock metrics every 10s
```

### 5. frontend

```bash
cd services/frontend
npm install
npm run dev                 # http://localhost:5173
```

## Sanity checks

- `curl http://localhost:4000/health` → history-service
- `curl http://localhost:5000/health` → alert-service
- `curl http://localhost:5050/health` → notifier
- After collector-service has run for ~10s: `curl http://localhost:4000/metrics`
  should return synthetic metric rows
- Open `http://localhost:5173` — resources, recent metrics, and any
  triggered alerts (CPU rule fires above 80%) should appear and refresh
  every 5s

## Ports

| Service | Port |
|---|---|
| history-service | 4000 |
| alert-service | 5000 |
| notifier | 5050 |
| frontend | 5173 |
| collector-service | — (no HTTP server, just posts out) |
