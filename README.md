# Impact Investing Market Research Tool

Platform for analyzing social impact, climate risk, and sustainability across investment portfolios. Portfolio management, GHG emissions (Scope 1–3), ESG scoring, climate risk assessment, peer benchmarking, and report generation.

[PRD](docs/PRD.md) · [Roadmap](docs/ROADMAP.md) · [Links](docs/LINKS.md)

## Stack

- **Backend:** FastAPI, SQLAlchemy
- **Frontend:** React, TypeScript, Vite, Tailwind, Recharts
- **DB:** SQLite (dev) / PostgreSQL (prod)

## Setup

Requires Python 3.9+ and Node.js 18+.

```bash
# Install
./install_dependencies.sh   # or install_dependencies.bat on Windows

# Backend
cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Or use `start-backend.bat` / `start-frontend.bat` (Windows) or `./start-backend.sh` / `./start-frontend.sh` (Mac/Linux).

**URLs:** Frontend → http://localhost:3000 · API → http://localhost:8000 · API docs → http://localhost:8000/docs

## Environment

Dev defaults to SQLite; no config needed. For PostgreSQL:

```bash
cd backend && python configure_env.py
```

See [backend/ENV_CONFIGURATION.md](backend/ENV_CONFIGURATION.md) for details.

## Production

1. Set up PostgreSQL ([backend/database_setup.md](backend/database_setup.md))
2. Set `DATABASE_URL` in `backend/.env`
3. `python backend/init_db.py`
4. Build frontend: `cd frontend && npm run build`
5. Run backend: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`

## API Overview

| Resource | Endpoints |
|----------|-----------|
| Investments | `GET/POST /api/investments`, `GET/PUT/DELETE /api/investments/{id}` |
| Climate Risk | `GET/POST /api/climate-risks`, `GET /api/investments/{id}/climate-analysis` |
| Emissions | `GET/POST /api/ghg-emissions`, `GET /api/portfolio/emissions-dashboard` |
| Social Impact | `GET/POST /api/social-impacts`, `GET /api/investments/{id}/social-impact-score` |
| ESG | `GET/POST /api/esg-scores`, `GET /api/investments/{id}/esg-analysis` |
| Reports | `GET /api/reports/portfolio-summary`, `climate-risk-report`, `impact-report` |

Full OpenAPI docs at `/docs` when backend is running.

## License

MIT
