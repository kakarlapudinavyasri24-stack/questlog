# QuestLog User Manual

## Overview

QuestLog turns daily task management into a lightweight RPG loop. Tasks are
quests, completed work earns XP, abandoned work costs HP, and each day can end
with a short Daily Chronicle summarizing the adventure.

## Getting Started

1. Start the backend with `npm run dev:backend`.
2. Start the frontend with `npm run dev:frontend`.
3. Open `http://127.0.0.1:5174`.
4. Add your first quest from the quest form.

## Quest Types

QuestLog supports three quest types:

| Type        | XP Reward | HP Loss When Abandoned | Recommended Use                         |
| ----------- | --------: | ---------------------: | --------------------------------------- |
| Main quest  |     45 XP |                  25 HP | Important work or deep-focus tasks.     |
| Side quest  |     30 XP |                  15 HP | Useful but secondary tasks.             |
| Daily quest |     20 XP |                  10 HP | Habits, chores, and repeating routines. |

## Adding a Quest

1. Enter a title in the quest input.
2. Choose `Main quest`, `Side quest`, or `Daily quest`.
3. Select `+ Add Quest`.

The quest appears in the active quest list and is saved by the backend.

## Completing or Abandoning a Quest

Active quests show two actions:

- The XP button completes the quest and awards XP.
- The HP button abandons the quest and subtracts HP.

Completed and abandoned quests remain visible so your daily progress can be
included in stats and the Daily Chronicle.

## XP, Levels, HP, and Streaks

- XP increases when quests are completed.
- HP starts at 100 and decreases when quests are abandoned.
- Levels advance automatically as XP crosses level thresholds.
- A 3-day streak applies a 1.5x XP multiplier.
- A 7-day streak applies a 2x XP multiplier.

## Badges

Open the `Badges` tab to view available badges. Badges unlock automatically when
you meet their conditions, such as completing your first quest, reaching a
streak, logging all quest types, or generating a Daily Chronicle.

## Daily Chronicle

Use `Generate Chronicle` in the Daily Chronicle panel to create a short fantasy
summary of the day. The current application uses mock chronicle generation. The
settings dialog includes a Claude API key field for future integration, but the
backend currently returns mock stories even when demo mode is disabled.

## Settings

Open `Settings` from the top bar.

Available settings:

- `Claude API Key`: Stored in browser `localStorage`; not currently used by the
  backend.
- `Use mock chronicle`: Keeps chronicle generation in demo mode.

## Data Storage

- Quests are stored in `backend/db.json`.
- Game progress and settings are stored in browser `localStorage`.

Clearing browser storage resets XP, HP, streaks, badges, and settings for that
browser. Editing or deleting `backend/db.json` changes stored quests.

## Troubleshooting

If quests do not load:

1. Confirm the backend is running on `http://localhost:4000`.
2. Confirm the frontend is configured with the correct `VITE_API_URL`.
3. Refresh the frontend page.

If the frontend cannot start:

1. Run `npm install`.
2. Run `npm run dev:frontend`.
3. Check whether port `5174` is already in use.

If the backend cannot start:

1. Run `npm install`.
2. Run `npm run dev:backend`.
3. Check whether port `4000` is already in use.
