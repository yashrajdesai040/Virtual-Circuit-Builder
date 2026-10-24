# CircuitLab — Phase 1 (Setup + Auth)

Virtual circuit builder college project. This is Phase 1 only: project
skeleton, database, and full login/register flow with JWT auth.

## What's included

**Backend** (`/backend` — Flask)
- `app.py` — app factory, registers blueprints, creates DB tables on boot
- `models.py` — `User` model (Phase 1) + `Project` model (schema stub for Phase 3)
- `auth.py` — `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `config.py` — SQLite by default, swap `DATABASE_URL` for Postgres later

**Frontend** (`/frontend` — React + Vite)
- Login and Register pages, JWT stored client-side, protected `/dashboard` route
- Design: dark PCB-inspired theme (`src/index.css` has all the color/type tokens)
- `CircuitBackground.jsx` — ambient animated trace lines (signature visual)
- `PowerButton.jsx` — the submit button doubles as a continuity-tester LED
  (dim → pulsing teal while signing in → red flicker on error)

## Run it

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Runs on `http://127.0.0.1:5000`. SQLite DB file (`circuitlab.db`) is created
automatically on first run — nothing to configure.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. The Vite dev server proxies `/api/*` to
the Flask backend, so no CORS headaches locally.

### 3. Try it

Open `http://localhost:5173` → you'll land on `/login` → click "Create an
account" → register → you're redirected to `/dashboard`, which confirms
your JWT round-trips correctly (name is pulled live from `/api/auth/me`).

## Notes for later phases

- `Project.circuit_json` in `models.py` is already stubbed — this is where
  the node/edge graph from the Phase 3 circuit builder will be stored.
- Swap SQLite → Postgres later by just setting the `DATABASE_URL` env var;
  no code changes needed since it's all through SQLAlchemy.
- Password hashing uses Werkzeug's `generate_password_hash` (PBKDF2) — fine
  for a college project, no need for bcrypt/argon2 unless you want to
  mention it in your report as a "future improvement."
- **Before you submit/deploy:** change `JWT_SECRET_KEY` in `config.py` to a
  real secret (set it as an env var, don't hardcode it).
