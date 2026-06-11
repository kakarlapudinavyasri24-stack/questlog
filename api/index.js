const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const DB_PATH = path.join("/tmp", "db.json");

app.use(cors());
app.use(express.json());

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    return { tasks: Array.isArray(data.tasks) ? data.tasks : [] };
  } catch {
    return { tasks: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function normalizeTaskType(type) {
  return ["main", "side", "daily"].includes(type) ? type : "daily";
}

function mockChronicle(tasks, gameState = {}, lang = "en") {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed");
  const abandoned = tasks.filter((t) => t.status === "abandoned");
  const active = tasks.filter((t) => t.status === "active");
  const hp = Number(gameState.hp ?? 100);
  const streak = Number(gameState.streak ?? 0);
  const title = gameState.title || "Wanderer";
  const completionRate =
    typeof gameState.completionRate === "number"
      ? gameState.completionRate
      : total === 0
        ? 0
        : Math.round((completed.length / total) * 100);

  if (lang === "hi") {
    if (total === 0)
      return `आज ${title} के लॉग में कोई क्वेस्ट दर्ज नहीं थी। कल, एक छोटी सी क्वेस्ट भी किंवदंती की शुरुआत कर सकती है।`;
    const cNames = completed
      .slice(0, 3)
      .map((t) => `"${t.title}"`)
      .join(", ");
    const aNames = abandoned
      .slice(0, 2)
      .map((t) => `"${t.title}"`)
      .join(", ");
    const opening =
      hp <= 35
        ? `लहूलुहान पर डटे हुए, ${title} ने आज ${total} क्वेस्टों का सामना किया।`
        : completionRate === 100
          ? `${title} ने आज की सभी क्वेस्ट जीतकर विजय का परचम लहराया।`
          : `${title} ने दृढ़ संकल्प के साथ आज ${total} क्वेस्टों का सामना किया।`;
    const progress =
      completed.length > 0
        ? `${completed.length} क्वेस्ट पूरी हुईं, जिनमें ${cNames} शामिल हैं।`
        : "कोई क्वेस्ट पूरी नहीं हुई।";
    const losses =
      abandoned.length > 0
        ? `${aNames} पीछे रह गए।`
        : active.length > 0
          ? `${active.length} क्वेस्ट कल की दहलीज़ पर हैं।`
          : "कोई क्वेस्ट नहीं छोड़ी गई।";
    const streakLine =
      streak >= 7
        ? `${streak} दिनों की धधकती स्ट्रीक।`
        : streak >= 3
          ? `${streak} दिनों की लौ और तेज़ जली।`
          : "लौ अभी नई है।";
    const closing = hp <= 35 ? "अभी विश्राम करो।" : "एक नया सवेरा द्वार पर खड़ा है।";
    return `${opening} ${progress} ${losses} ${streakLine} ${closing}`;
  }

  if (total === 0)
    return `The ${title} found no quests today. Tomorrow, even one small quest can begin the legend again.`;
  const cNames = completed
    .slice(0, 3)
    .map((t) => `"${t.title}"`)
    .join(", ");
  const aNames = abandoned
    .slice(0, 2)
    .map((t) => `"${t.title}"`)
    .join(", ");
  const opening =
    hp <= 35
      ? `Bloodied but upright, the ${title} faced ${total} quest${total === 1 ? "" : "s"} today.`
      : completionRate === 100
        ? `The ${title} conquered every quest in sight.`
        : `The ${title} faced ${total} quest${total === 1 ? "" : "s"} with steady resolve.`;
  const progress =
    completed.length > 0
      ? `${completed.length} completed, including ${cNames}.`
      : "No quest was completed, but the attempt was recorded.";
  const losses =
    abandoned.length > 0
      ? `${abandoned.length} path${abandoned.length === 1 ? "" : "s"} fell away — ${aNames} left behind.`
      : active.length > 0
        ? `${active.length} quest${active.length === 1 ? "" : "s"} shimmer on the edge of tomorrow.`
        : "No quest was abandoned.";
  const streakLine =
    streak >= 7
      ? `A blazing ${streak}-day streak.`
      : streak >= 3
        ? `The ${streak}-day flame burned hotter.`
        : "The flame is young but growing.";
  const closing = hp <= 35 ? "Rest now and return sharper." : "Another dawn waits at the gate.";
  return `${opening} ${progress} ${losses} ${streakLine} ${closing}`;
}

app.get("/api", (req, res) => res.send("Questlog API running."));
app.get("/api/tasks", (req, res) => res.json(readDb().tasks));

app.post("/api/tasks", (req, res) => {
  const { title, type } = req.body;
  if (!title) return res.status(400).json({ error: "Task title is required." });
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

app.put("/api/tasks/:id", (req, res) => {
  const { status } = req.body;
  const data = readDb();
  const task = data.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });
  if (status) task.status = status;
  writeDb(data);
  res.json(task);
});

app.post("/api/chronicle", (req, res) => {
  const { tasks, gameState, lang = "en" } = req.body;
  res.json({ story: mockChronicle(tasks || [], gameState || {}, lang) });
});

module.exports = app;
