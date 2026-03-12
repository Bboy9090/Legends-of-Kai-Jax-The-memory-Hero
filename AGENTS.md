# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

| Service | Path | Tech | Port | Notes |
|---|---|---|---|---|
| 3D Game Client | `apps/web/` | React + Vite + Three.js | 5000 | **Primary product.** Self-contained, no backend needed. |
| Game Hub Frontend | `frontend/` | React + CRA/CRACO | 3000 | Lore/info hub. Requires backend API via `REACT_APP_BACKEND_URL`. |
| Backend API | `backend/server.py` | FastAPI + uvicorn | 8000 | Requires MongoDB (`MONGO_URL`, `DB_NAME` in `backend/.env`). |

### Running the 3D Game Client (primary)

```bash
cd apps/web && npx vite --host 0.0.0.0 --port 5000
```

This is the main product and is fully self-contained — all game data is embedded in TypeScript source files. No backend or database needed.

### Running the backend + Game Hub frontend (optional)

The backend requires a running MongoDB instance. Set env vars `MONGO_URL` and `DB_NAME` in `backend/.env`, then:

```bash
cd backend && uvicorn server:app --host 0.0.0.0 --port 8000
cd frontend && REACT_APP_BACKEND_URL=http://localhost:8000 yarn start
```

### Validation and testing

See `README.md` and `copilot-instructions.md` for canonical validation commands. Key commands:

```bash
python3 validate_all.py          # Comprehensive validation (characters + schema + cross-check)
python3 validate_characters.py   # Character data only
python3 test_schema_validation.py # Story schema only
cd apps/web && npx vite build    # Build check for 3D game client
cd frontend && npx craco build   # Build check for Game Hub frontend
```

### Gotchas

- The `emergentintegrations` Python package in `backend/requirements.txt` is a private/custom package not available on PyPI. Install core backend deps individually: `pip install fastapi uvicorn motor python-dotenv pydantic python-jose passlib python-multipart`.
- `backend/requirements.txt` has pinned version conflicts (e.g., `fastapi==0.110.1` vs `starlette==0.49.1`). Install without strict version pins.
- TypeScript strict mode (`tsc -b`) in `apps/web` shows pre-existing type errors (Three.js type mismatches). Vite builds fine since it skips strict TS checks.
- The frontend (`frontend/`) has ESLint 9.x as devDependency but no `eslint.config.js` — linting is handled internally by `react-scripts`/CRACO.
- `~/.local/bin` must be on `PATH` for Python tools (uvicorn, flake8, etc.).
- No automated test files exist in `apps/web` or `frontend`.
