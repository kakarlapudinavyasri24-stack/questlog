# QuestLog Agent Guide

This file is the working guide for coding agents in this repository. It reflects
the code that exists now, not only the future-looking Spec Kit plan.

## Project Snapshot

QuestLog is a gamified task manager where tasks are RPG-style quests. Users can
create main, side, and daily quests; complete or abandon them; gain XP; lose HP;
unlock badges; keep streaks; and generate a Daily Chronicle.

The implemented app is a small JavaScript monorepo:

- `frontend/`: React 18 + Vite + vanilla CSS.
- `backend/`: Node.js + Express 5 + file-backed JSON storage.
- `specs/001-questlog-platform/`: Spec Kit documents for a larger planned
  platform.
- `.specify/` and `.gemini/`: generated Spec Kit/Gemini command and workflow
  infrastructure.

Important: the specs describe a future TypeScript/PostgreSQL/auth/mood/insights
architecture. The current implementation is JavaScript, no auth, `backend/db.json`
storage, and a mock-only chronicle endpoint.

## Repository Layout

```text
.
├── backend/
│   ├── server.js              # Express API and mock chronicle generator
│   ├── db.json                # Active file storage for tasks
│   ├── backend/db.json        # Empty duplicate/nested data file; not used by server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/App.jsx            # Main application component and game logic
│   ├── src/main.jsx           # React entrypoint
│   ├── src/index.css          # Active app styling
│   ├── src/App.css            # Mostly leftover template styles; not imported now
│   ├── public/                # Favicon and icon symbols
│   ├── package.json
│   └── vite.config.js
├── specs/001-questlog-platform/
│   ├── spec.md
│   ├── plan.md
│   ├── tasks.md
│   ├── data-model.md
│   ├── research.md
│   ├── quickstart.md
│   └── contracts/api.md
├── .specify/                  # Spec Kit generated scripts/templates/extensions
├── .gemini/                   # Gemini command definitions for Spec Kit
├── GEMINI.md                  # Managed Spec Kit pointer to current plan
├── README.md                  # User-facing project overview
└── AGENTS.md
```

There are two duplicate/oddly named markdown files at the root:

- `CONTRIBUTING.md` and ` CONTRIBUTING.md` have the same content.
- `CODE_OF_CONDUCT.md ` has a trailing space in its filename.
- A root file named ```` is empty.

Do not rename or delete these unless the user explicitly asks.

## Run Commands

Backend:

```bash
cd backend
npm install
npm start
```

The backend listens on `http://localhost:4000` by default. It also accepts
`PORT` and `HOST`.

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Build:

```bash
cd frontend
npm run build
```

There is no real test suite yet. `backend/package.json` has a placeholder
`npm test` script that exits with an error. `frontend/package.json` has no
`lint` script even though `eslint.config.js` exists.

## Current Backend Behavior

`backend/server.js` is CommonJS and contains all backend logic in one file.

Storage:

- Active DB path is `backend/db.json`.
- Shape is `{ "tasks": [...] }`.
- Reads fall back to `{ tasks: [] }` if the file is missing or invalid.

Endpoints:

- `GET /`: returns a plain health message.
- `GET /tasks`: returns all tasks.
- `POST /tasks`: creates a task from `{ title, type }`.
- `PUT /tasks/:id`: updates task `status` if provided.
- `POST /chronicle`: returns `{ story }` from the local mock generator.

Task shape:

```json
{
  "id": "Date.now().toString()",
  "title": "Quest title",
  "type": "main | side | daily",
  "status": "active | completed | abandoned",
  "createdAt": "ISO timestamp"
}
```

Current limitations to preserve unless changing intentionally:

- `PUT /tasks/:id` does not validate status values.
- `POST /chronicle` ignores API keys and non-demo mode; both branches use the
  mock chronicle.
- There is no delete endpoint.
- There is no user model, auth, PostgreSQL, or AI provider integration.

## Current Frontend Behavior

`frontend/src/App.jsx` owns most application state and behavior:

- Fetches tasks from `http://localhost:4000`.
- Stores game state in `localStorage` under `questlog-game`.
- Stores settings in `localStorage` under `questlog-settings`.
- Calculates XP, HP loss, levels, streak multipliers, badges, and stats in the
  client.
- Calls `/chronicle` with tasks, game state, API key, and demo mode.

Main constants:

- Quest types: `main`, `side`, `daily`.
- XP rewards: main 45, side 30, daily 20.
- HP damage: main 25, side 15, daily 10.
- Streak multipliers: 3 days = 1.5x, 7 days = 2x.
- Badges are defined in `BADGES` in `App.jsx`.

Styling:

- `frontend/src/index.css` is the active stylesheet.
- The UI uses a pixel/RPG visual style, square corners, dark panels, gold
  buttons, and CSS custom properties.
- `frontend/src/App.css` appears to be unused Vite template CSS. Avoid adding to
  it unless it is imported.
- Google Fonts are imported from CSS, so network availability affects fonts.

## Spec Kit Notes

The active feature pointer is `.specify/feature.json`:

```json
{ "feature_directory": "specs/001-questlog-platform" }
```

`GEMINI.md` has a managed Spec Kit block pointing to
`specs/001-questlog-platform/plan.md`.

When working from specs:

- Treat `spec.md` as product intent.
- Treat `plan.md`, `tasks.md`, `data-model.md`, `contracts/api.md`, and
  `quickstart.md` as planned direction, not a description of the current code.
- If implementing planned TypeScript/PostgreSQL/auth/API changes, make that a
  deliberate migration and update docs/commands accordingly.
- The constitution file `.specify/memory/constitution.md` is still a template
  with placeholders, not real project governance.

The Spec Kit extensions currently installed are `agent-context` and `git`.
Auto-commit settings in `.specify/extensions/git/git-config.yml` are disabled by
default.

## Development Guidelines

- Keep frontend and backend boundaries simple: React calls the Express API;
  server code owns file persistence and chronicle generation.
- Prefer small, focused changes. This project is compact and currently has no
  shared module structure.
- Do not introduce TypeScript, databases, auth, external AI SDKs, or routing
  frameworks as incidental cleanup. Those are larger product decisions.
- Preserve existing JSON data unless the user asks to reset it.
- Do not commit API keys. The current API key field is stored in browser
  `localStorage` and sent to the backend, but the backend does not use it.
- If adding backend endpoints, update `README.md` and consider updating
  `specs/001-questlog-platform/contracts/api.md`.
- If adding user-facing flows, keep mobile behavior in mind; `index.css` has
  breakpoints at 1100px and 700px.
- Use `rg` for searching.
- Use `npm install` inside each package directory when dependencies are missing.

## Verification Checklist

For backend changes:

```bash
cd backend
npm start
```

Then manually exercise relevant endpoints, for example:

```bash
curl http://localhost:4000/tasks
```

For frontend changes:

```bash
cd frontend
npm run build
```

For full app smoke testing:

1. Start backend on port 4000.
2. Start frontend on port 5174.
3. Add a quest.
4. Complete or abandon it.
5. Generate a Chronicle.
6. Confirm `backend/db.json` and browser `localStorage` behavior are expected.

## Known Gaps

- No automated tests.
- No delete quest endpoint despite spec CRUD requirement.
- Chronicle is mock-only.
- Profile button is visual only.
- Spec/API docs and implementation disagree on paths and architecture:
  implemented routes are `/tasks` and `/chronicle`; planned contracts use
  `/api/v1/quests`, `/api/v1/summaries`, auth, moods, insights, and users.
- `frontend/index.html` title is still `frontend`.
- Root docs mention level titles that do not exactly match implemented levels.
