# QuestLog

QuestLog is a pixel-style gamified task manager where everyday work becomes RPG
quests. Create main, side, and daily quests, complete them for XP, abandon them
with HP consequences, unlock badges, keep streaks, and generate a story-like
Daily Chronicle.

---

## Live Demo

 https://spectacular-kitten-e45c33.netlify.app/

---


## Features

- Create main, side, and daily quests.
- Complete quests to earn XP.
- Abandon quests and lose HP based on quest type.
- Track level progress, HP, streaks, completion rate, and badge unlocks.
- Generate a Daily Chronicle using the current mock narrative engine.
- Store tasks in a lightweight file-backed backend.
- Store game state and settings in browser `localStorage`.

## Tech Stack

- Frontend: React 18, Vite, vanilla CSS.
- Backend: Node.js, Express 5, JSON file storage.
- Tooling: ESLint, Prettier, Knip, Vitest, Husky, lint-staged, Gitleaks,
  Git-Cliff, GitLab CI.

## Project Structure

```text
questlog/
├── backend/
│   ├── server.js
│   ├── db.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── specs/
├── AGENTS.md
├── USER_MANUAL.md
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.
- Docker, optional.
- Gitleaks and Git-Cliff, optional for local secret scanning and changelog
  generation. CI uses container images for those checks.

## Installation

Install all workspace dependencies from the repository root:

```bash
npm install
```

You can also install packages independently if needed:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Environment Variables

Copy the example file before local development:

```bash
cp .env.example .env
```

Supported variables:

| Variable            | Default                 | Description                                                                 |
| ------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `PORT`              | `4000`                  | Backend port.                                                               |
| `HOST`              | `0.0.0.0`               | Backend bind address.                                                       |
| `NODE_ENV`          | `development`           | Runtime environment.                                                        |
| `VITE_API_URL`      | `http://localhost:4000` | Frontend API base URL.                                                      |
| `ANTHROPIC_API_KEY` | unset                   | Placeholder for future AI integration. The current backend does not use it. |

## Running Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

Open:

```text
http://127.0.0.1:5174
```

## API Endpoints

| Method | Path         | Description                                                         |
| ------ | ------------ | ------------------------------------------------------------------- |
| `GET`  | `/`          | Backend health message or built frontend if `frontend/dist` exists. |
| `GET`  | `/tasks`     | Return all quests.                                                  |
| `POST` | `/tasks`     | Create a quest from `{ "title": "...", "type": "daily" }`.          |
| `PUT`  | `/tasks/:id` | Update quest status.                                                |
| `POST` | `/chronicle` | Generate a mock Daily Chronicle.                                    |

## Testing and Compliance

Run all repository quality checks:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run coverage
npm run audit
```

Run secret scanning locally if Gitleaks is installed:

```bash
npm run secrets
```

Generate or update the changelog locally if Git-Cliff is installed:

```bash
npm run changelog
```

## Docker Usage

Build the production image:

```bash
docker build -t questlog .
```

Run it:

```bash
docker run --rm -p 4000:4000 --env-file .env questlog
```

Open:

```text
http://localhost:4000
```

The Docker image builds the Vite frontend and serves the built assets through the
Express backend when `frontend/dist` is present.

## Contribution Guide

1. Create a feature branch.
2. Install dependencies with `npm install`.
3. Make focused changes that preserve existing QuestLog behavior.
4. Run linting, formatting checks, tests, coverage, type checking, audit, and
   secret scanning before opening a merge request.
5. Update documentation when behavior, commands, environment variables, or API
   contracts change.
6. Use clear commit messages. Conventional commit prefixes such as `feat:`,
   `fix:`, `docs:`, `test:`, and `ci:` improve changelog generation.

See [AGENTS.md](AGENTS.md) for repository-specific implementation notes and
[USER_MANUAL.md](USER_MANUAL.md) for end-user workflows.
