#  QuestLog

**QuestLog** is a pixel-style gamified task manager where everyday tasks become RPG quests. Complete quests to gain XP, level up, unlock badges, maintain streaks, and generate a personalized **Daily Chronicle** of your adventures.

---

##  Features

### Quest System

* Create **Main**, **Side**, and **Daily** quests
* Complete quests to earn XP
* Abandon quests with HP penalties
* Track quest progress in real-time

### Health & Experience

* ❤️ HP bar starts at **100**
* ⚠️ HP penalties for abandoned quests:

  * Main Quest: **-25 HP**
  * Side Quest: **-15 HP**
  * Daily Quest: **-10 HP**
* ⭐ Earn XP for completed quests
* 📈 Progress through multiple levels

### Level Titles

Advance through 7 RPG-inspired titles:

1. Wanderer
2. Adventurer
3. Explorer
4. Champion
5. Hero
6. Legend
7. Mythic

### Streak Multipliers

Maintain consistency and earn bonus XP:

* 🔥 3-Day Streak → **1.5× XP**
* 🔥 7-Day Streak → **2× XP**

### Achievements & Rewards

* 🎖️ Unlock badges as you progress
* 🏆 11 collectible badges
* 🎉 Level-up modal notifications
* ✨ Badge unlock animations

### Daily Chronicle

Generate a story-style summary of your day based on completed quests and achievements.

* Demo/Mock Chronicle mode
* Optional Claude AI integration
* Personalized daily adventure logs

---

##  Tech Stack

### Frontend

* React
* Vite
* Vanilla CSS
* Fetch API

### Backend

* Node.js
* Express.js
* File-based storage (`db.json`)

---

##  Project Structure

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
└── README.md
```

---

##  Getting Started

### Prerequisites

Make sure you have installed:

* Node.js (v18+ recommended)
* npm

---

##  Running the Backend

Open a terminal:

```bash
cd backend
npm install
node server.js
```

You should see:

```text
Questlog backend running on http://localhost:4000
```

Keep this terminal running.

---

##  Running the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174
```

---

##  Chronicle Settings

Click the **Settings** button inside the application.

### Demo Mode (Recommended)

* Keep **Use Mock Chronicle** enabled
* No API key required

### Claude-Powered Chronicle

1. Disable **Use Mock Chronicle**
2. Paste your Anthropic Claude API key
3. Save Settings

The backend sends requests to Claude only when:

* Mock mode is disabled
* A valid API key is provided

---

##  API Endpoints

### Get All Tasks

```http
GET /tasks
```

Returns all saved quests.

---

### Create a Quest

```http
POST /tasks
```

#### Request Body

```json
{
  "title": "Finish assignment",
  "type": "daily"
}
```

---

### Update Quest Status

```http
PUT /tasks/:id
```

#### Request Body

```json
{
  "status": "completed"
}
```

#### Allowed Status Values

```text
completed
abandoned
```

---

### Generate Daily Chronicle

```http
POST /chronicle
```

Generates a Daily Chronicle using quest and game-state data.

---

##  Troubleshooting

### Add Quest Doesn't Work

Ensure the backend is running:

```bash
cd backend
node server.js
```

Then visit:

```text
http://localhost:4000/tasks
```

Expected response:

```json
[]
```

If you receive **404 Not Found**, another application may be using port **4000**.

#### Windows PowerShell

Find the process:

```powershell
Get-NetTCPConnection -LocalPort 4000 -State Listen
```

Stop the process:

```powershell
Stop-Process -Id YOUR_PROCESS_ID
```

Restart the backend afterward.

---

### Frontend Opens the Wrong Vite App

Run QuestLog on a dedicated port:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

Then open:

```text
http://127.0.0.1:5174
```

---

##  Build Verification

### Frontend Build Check

```bash
cd frontend
npm run build
```

### Backend Syntax Check

```bash
cd backend
node --check server.js
```

---

##  Game Loop

1. Create quests
2. Complete quests to earn XP
3. Build streaks for bonus rewards
4. Avoid abandoning quests to preserve HP
5. Unlock badges and titles
6. Generate your Daily Chronicle
7. Become a **Mythic Adventurer**

---

**QuestLog transforms productivity into an RPG adventure—turn your daily goals into epic quests.**
