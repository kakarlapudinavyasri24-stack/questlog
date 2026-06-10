# ⚔️ Questlog

###  Team: Accio Duo

> “Your tasks are already a story. Questlog just tells it.”

---

##  Overview

Questlog is a **gamified productivity + narrative reflection system** where tasks are not just checkboxes — they are **quests in a living RPG-like experience**.

Every task you complete or abandon shapes your:
- Character stats
- World state
- Daily story (Chronicle)

At the end of the day, Questlog transforms your actions into a **short AI-generated narrative of your day**.

---

##  Core Idea

**Task → Action → Game State → Story**

Users add tasks as quests, complete or abandon them, and the system evolves their character and world. The day ends with a personalized Chronicle that reflects their performance.

---

##  GAME MECHANICS (LIVE SYSTEM)

###  HP System
- Starts at **100 HP**
- HP decreases when quests are abandoned:
  - Main Quest: -25 HP
  - Side Quest: -15 HP
  - Daily Quest: -10 HP
- UI changes color to red when HP is critical

---

###  XP + LEVEL SYSTEM
- XP gained on every completed quest
- Level progression system included
- 7 Titles:
  - Wanderer
  - Explorer
  - Adventurer
  - Warrior
  - Knight
  - Legend
  - Mythic

- Level-up triggers a **modal popup** announcing new rank

---

###  STREAK MULTIPLIER
- Tracks consecutive productive days
- Bonuses:
  - 3-day streak → 1.5x XP
  - 7-day streak → 2x XP
- Visual 🔥 flame counter shows streak status

---

###  WORLD STATE EVOLUTION
- Visual world changes based on progression:
  - Knight+ → weather emojis evolve
  - Mythic → full ✨⚡ cosmic aesthetic
- Reflects user's productivity journey visually

---

##  REWARD SYSTEM

###  Badges System (11 Total)
- First Blood
- Perfect Day
- Survivor
- Strategist
- Ghost
- Chronicler
- Variety Hero
- On Fire
- Unstoppable
- Centurion
- Creature of Habit

---

###  Badge Unlock System
- Instant popup when a badge is earned
- Dedicated Badges page:
  - Shows locked vs unlocked achievements
  - Acts as a progression wall

---

##  DAILY CHRONICLE SYSTEM

The Chronicle is dynamically generated based on user performance:

### Narrative Adaptation Logic:
- 🟥 Low HP → gritty, broken, reflective tone
- 🟩 100% completion → triumphant heroic tone
- 🔥 High streak → narrator acknowledges consistency
- 🏆 High level → narrator addresses user by title (Knight / Legend / Mythic)

---

##  TECH STACK

- Frontend: React + Vite
- Backend: Node.js + Express
- Storage: db.json (lightweight file-based system)
- AI Layer: Claude API (Chronicle generation)
- Deployment: Render / Railway (single deployment)

---

##  KEY FEATURES

- Quest-based task system
- RPG-style stat progression (HP, XP, Levels)
- Dynamic streak multiplier system
- Badge unlocking system
- AI-generated daily Chronicle
- Reactive narrative based on player state
- Lightweight full-stack architecture (no heavy DB setup)

---

##  WHY QUESTLOG?

Most productivity apps feel like obligation trackers.

Questlog solves this by:
- Turning tasks into quests
- Turning productivity into a game
- Turning the end of the day into a story worth reading

---

##  IMPACT

Instead of asking:
> “Did you finish your tasks?”

Questlog asks:
> “What kind of story did you create today?”

---

##  TEAM

**Accio Duo**