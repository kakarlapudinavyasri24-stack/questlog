# Contributing to Questlog

Thanks for your interest in contributing! Questlog is a gamified task tracker built with React and a Node.js backend. This guide covers everything you need to get started.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Commit Style](#commit-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Code Style](#code-style)

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Setup

```bash
# 1. Fork and clone the repo
git clone https://github.com/your-username/questlog.git
cd questlog

# 2. Install dependencies
npm install

# 3. Start the backend (port 4000)
npm run server

# 4. In a separate terminal, start the frontend (port 5173)
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
questlog/
├── src/
│   ├── App.jsx          # Main React component — game logic, state, UI
│   └── node.css         # All styles (pixel art / Codédex-inspired theme)
├── server/
│   └── index.js         # Express API — tasks + chronicle endpoint
└── package.json
```

Key constants live at the top of `App.jsx`: `XP_REWARD`, `HP_DAMAGE`, `LEVELS`, and `BADGES`. Most game-mechanic changes start there.

---

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes.
3. Test manually — add a quest, complete it, abandon one, and generate a Chronicle to make sure nothing is broken.
4. Commit and open a pull request.

---

## Making Changes

### Game mechanics (`App.jsx`)

- XP rewards, HP damage, and level thresholds are defined as plain objects near the top of the file — edit those values directly rather than hardcoding numbers in logic.
- Badge evaluation lives in `evaluateBadges()`. Add new badge checks there and register the badge in the `BADGES` array.
- Keep game state updates immutable — always spread into a new object rather than mutating `game` directly.

### Styles (`node.css`)

- The design uses CSS custom properties defined in `:root`. Colour and spacing changes should go there first.
- `Press Start 2P` is used sparingly for kickers and the brand name only — don't apply it to body copy or interactive elements.
- Keep responsive breakpoints at `1100px` (sidebar stacks) and `700px` (single-column forms).

### Backend (`server/index.js`)

- Tasks are stored in-memory. If you're adding persistence, keep the existing REST shape (`GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `POST /chronicle`) so the frontend doesn't need changes.
- The `/chronicle` endpoint accepts a `demoMode` flag — make sure any changes respect that and don't break the mock path.

---

## Commit Style

Use short, lowercase imperative messages:

```
feat: add weekly recap badge
fix: hp not reducing on quest abandon
style: tighten streak card spacing
refactor: extract getLevelInfo to utils
docs: update contributing guide
```

One concern per commit is preferred over large catch-all commits.

---

## Pull Request Process

1. Open a PR against `main` with a clear title and a short description of what changed and why.
2. If your PR changes game balance (XP values, HP damage, level thresholds), explain the reasoning.
3. Screenshots or screen recordings are welcome for UI changes.
4. A maintainer will review and may request changes before merging.

---

## Reporting Bugs

Open an issue and include:

- What you did (steps to reproduce)
- What you expected to happen
- What actually happened
- Browser and OS

---

## Feature Requests

Open an issue with the `enhancement` label. Describe the feature and why it fits Questlog's core idea — turning a task list into a narrative. Ideas that tie into the chronicle, levelling, or badge systems tend to be a good fit.

---

## Code Style

- Use `const` and `let`, never `var`.
- Prefer named functions over anonymous ones for anything that appears in JSX event handlers.
- No external UI libraries — keep the dependency footprint small.
- CSS class names use `kebab-case`; React component props use `camelCase`.

---

## Questions?

Open an issue or start a discussion. Happy questing. ⚔️