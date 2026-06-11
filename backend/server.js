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

// eslint-disable-next-line no-unused-vars
function buildChroniclePrompt(tasks, gameState, lang = "en") {
  const completed = tasks.filter((task) => task.status === "completed");
  const abandoned = tasks.filter((task) => task.status === "abandoned");
  const active = tasks.filter((task) => task.status === "active");
  const title = gameState?.title || "Wanderer";
  const hp = Number(gameState?.hp ?? 100);
  const streak = Number(gameState?.streak ?? 0);
  const completionRate = Number(gameState?.completionRate ?? 0);

  const languageInstruction =
    lang === "hi"
      ? "Write the entire chronicle in Hindi (Devanagari script). Do not translate the player's quest names — keep them exactly as entered. Do not use English words except for XP, HP, and the quest titles."
      : "Write the chronicle in English.";

  return [
    "Write a 3 to 5 sentence fantasy RPG daily chronicle for a gamified task app.",
    `Call the player by this title: ${title}.`,
    `HP: ${hp}. Completion rate: ${completionRate}%. Streak: ${streak} days.`,
    `Completed quests: ${completed.map((task) => task.title).join(", ") || "none"}.`,
    `Abandoned quests: ${abandoned.map((task) => task.title).join(", ") || "none"}.`,
    `Still active: ${active.map((task) => task.title).join(", ") || "none"}.`,
    "Use a gritty battered tone for low HP, triumphant tone for 100% completion, acknowledge long streaks, and keep it motivational.",
    languageInstruction
  ].join("\n");
}

function mockChronicle(tasks, gameState = {}, lang = "en") {
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

  if (lang === "hi") {
    if (total === 0) {
      return `आज ${title} के लॉग में कोई क्वेस्ट दर्ज नहीं थी — केवल एक शांत राह और प्रतीक्षा करता आकाश। राज्य में कोई हलचल नहीं हुई, पर इरादे की लौ अभी भी जल रही है। कल, एक छोटी सी क्वेस्ट भी किंवदंती की शुरुआत कर सकती है।`;
    }

    const completedNames = completed
      .slice(0, 3)
      .map((t) => `"${t.title}"`)
      .join(", ");
    const abandonedNames = abandoned
      .slice(0, 2)
      .map((t) => `"${t.title}"`)
      .join(", ");

    const opening =
      hp <= 35
        ? `लहूलुहान पर डटे हुए, ${title} ने आज ${total} क्वेस्ट${total === 1 ? "" : "ों"} के साथ एक कठिन दिन पार किया।`
        : completionRate === 100
          ? `${title} ने आज की सभी क्वेस्ट जीतकर विजय का परचम लहराया।`
          : `${title} ने दृढ़ संकल्प के साथ आज ${total} क्वेस्ट${total === 1 ? "" : "ों"} का सामना किया।`;

    const progress =
      completed.length > 0
        ? `${completed.length} क्वेस्ट पूरी हुईं, जिनमें ${completedNames} शामिल हैं।`
        : "कोई क्वेस्ट पूरी नहीं हुई, पर प्रयास का पाठ लॉग में दर्ज हो गया।";

    const losses =
      abandoned.length > 0
        ? `${abandoned.length} राह${abandoned.length === 1 ? "" : "ें"} छूट गईं — ${abandonedNames} पीछे रह गए।`
        : active.length > 0
          ? `${active.length} क्वेस्ट अभी भी कल की दहलीज़ पर चमक रह${active.length === 1 ? "ी है" : "ी हैं"}।`
          : "कोई क्वेस्ट नहीं छोड़ी गई, और दिन साफ़ तलवार के साथ बंद हुआ।";

    const streakLine =
      streak >= 7
        ? `${streak} दिनों की धधकती स्ट्रीक ने कथावाचक को गर्जना में बुला लिया।`
        : streak >= 3
          ? `${streak} दिनों की लौ और तेज़ जली, हर जीत को और ऊर्जा देती रही।`
          : "लौ अभी नई है, पर हर दिन का कदम उसे बड़ा करता है।";

    const closing =
      hp <= 35
        ? "अभी विश्राम करो, कवच सुधारो, और ज़ख्मों से तेज़ होकर लौटो।"
        : "वृत्तांत अनुभव के साथ बंद होता है — एक नया सवेरा द्वार पर खड़ा है।";

    return `${opening} ${progress} ${losses} ${streakLine} ${closing}`;
  }

  // English (original logic)
  if (total === 0) {
    return `The ${title} found no quests etched into the log today, only a quiet road and a waiting sky. The realm did not move, but the flame of intent still flickered. Tomorrow, even one small quest can begin the legend again.`;
  }

  const completedNames = completed
    .slice(0, 3)
    .map((task) => `"${task.title}"`)
    .join(", ");
  const abandonedNames = abandoned
    .slice(0, 2)
    .map((task) => `"${task.title}"`)
    .join(", ");

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
  const { tasks, gameState, lang = "en" } = req.body;
  const story = mockChronicle(tasks || [], gameState || {}, lang);
  res.json({ story });
});

const HOST = process.env.HOST || "0.0.0.0";
const LISTEN_ADDRESS = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

app.listen(PORT, HOST, () => {
  console.log(`Backend running at ${LISTEN_ADDRESS}`);
  console.log(`Listening on ${HOST}:${PORT}`);
});
