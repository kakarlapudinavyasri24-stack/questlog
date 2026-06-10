const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    return { tasks: Array.isArray(data.tasks) ? data.tasks : [] };
  } catch (error) {
    return { tasks: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function normalizeTaskType(type) {
  return ["main", "side", "daily"].includes(type) ? type : "daily";
}

function buildChroniclePrompt(tasks, gameState) {
  const completed = tasks.filter((task) => task.status === "completed");
  const abandoned = tasks.filter((task) => task.status === "abandoned");
  const active = tasks.filter((task) => task.status === "active");
  const title = gameState?.title || "Wanderer";
  const hp = Number(gameState?.hp ?? 100);
  const streak = Number(gameState?.streak ?? 0);
  const completionRate = Number(gameState?.completionRate ?? 0);

  return [
    "Write a 3 to 5 sentence fantasy RPG daily chronicle for a gamified task app.",
    `Call the player by this title: ${title}.`,
    `HP: ${hp}. Completion rate: ${completionRate}%. Streak: ${streak} days.`,
    `Completed quests: ${completed.map((task) => task.title).join(", ") || "none"}.`,
    `Abandoned quests: ${abandoned.map((task) => task.title).join(", ") || "none"}.`,
    `Still active: ${active.map((task) => task.title).join(", ") || "none"}.`,
    "Use a gritty battered tone for low HP, triumphant tone for 100% completion, acknowledge long streaks, and keep it motivational."
  ].join("\n");
}

function mockChronicle(tasks, gameState = {}) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed");
  const abandoned = tasks.filter((task) => task.status === "abandoned");
  const active = tasks.filter((task) => task.status === "active");
  const hp = Number(gameState.hp ?? 100);
  const streak = Number(gameState.streak ?? 0);
  const title = gameState.title || "Wanderer";
  const completionRate =
    typeof gameState.completionRate === "number"
      ? gameState.completionRate
      : total === 0
        ? 0
        : Math.round((completed.length / total) * 100);

  if (total === 0) {
    return `The ${title} found no quests etched into the log today, only a quiet road and a waiting sky. The realm did not move, but the flame of intent still flickered. Tomorrow, even one small quest can begin the legend again.`;
  }

  const completedNames = completed.slice(0, 3).map((task) => `"${task.title}"`).join(", ");
  const abandonedNames = abandoned.slice(0, 2).map((task) => `"${task.title}"`).join(", ");
  const opening =
    hp <= 35
      ? `Bloodied but upright, the ${title} dragged the Questlog through a hard day of ${total} quest${total === 1 ? "" : "s"}.`
      : completionRate === 100
        ? `The ${title} stood beneath a bright banner after conquering every quest in sight.`
        : `The ${title} crossed the map of the day and faced ${total} quest${total === 1 ? "" : "s"} with steady resolve.`;
  const progress =
    completed.length > 0
      ? `${completed.length} were completed, including ${completedNames}.`
      : "No quest was completed, but the log still recorded the lesson of the attempt.";
  const losses =
    abandoned.length > 0
      ? `${abandoned.length} path${abandoned.length === 1 ? "" : "s"} fell away, with ${abandonedNames} left behind.`
      : active.length > 0
        ? `${active.length} quest${active.length === 1 ? "" : "s"} still shimmer on the edge of tomorrow.`
        : "No quest was abandoned, and the day closed with clean steel.";
  const streakLine =
    streak >= 7
      ? `A blazing ${streak}-day streak made the narrator speak in thunder.`
      : streak >= 3
        ? `The ${streak}-day flame burned hotter, lending extra force to every victory.`
        : "The flame is young, but every day of action feeds it.";
  const closing =
    hp <= 35
      ? "Rest now, repair the armor, and return sharper than the wounds."
      : "The chronicle closes with experience earned and another dawn waiting at the gate.";

  return `${opening} ${progress} ${losses} ${streakLine} ${closing}`;
}

app.get("/", (req, res) => {
  res.send("Questlog backend is running.");
});

app.get("/tasks", (req, res) => {
  const data = readDb();
  res.json(data.tasks);
});

app.post("/tasks", (req, res) => {
  const { title, type } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const data = readDb();
  const newTask = {
    id: Date.now().toString(),
    title: String(title).trim(),
    type: normalizeTaskType(type),
    status: "active",
    createdAt: new Date().toISOString()
  };

  data.tasks.push(newTask);
  writeDb(data);
  res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const { status } = req.body;
  const data = readDb();
  const task = data.tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  if (status) {
    task.status = status;
  }

  writeDb(data);
  res.json(task);
});

app.post("/chronicle", (req, res) => {
  const { tasks, gameState, demoMode } = req.body;
  const story = demoMode ? mockChronicle(tasks || [], gameState || {}) : mockChronicle(tasks || [], gameState || {});
  res.json({ story });
});

const HOST = process.env.HOST || "0.0.0.0";
const LISTEN_ADDRESS = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

app.listen(PORT, HOST, () => {
  console.log(`Backend running at ${LISTEN_ADDRESS}`);
  console.log(`Listening on ${HOST}:${PORT}`);
});