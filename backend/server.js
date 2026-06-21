const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Database setup ────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'daily',
      status TEXT DEFAULT 'active',
      due_date TEXT,
      created_at TEXT
    )
  `);
  console.log("Database initialized.");
}

function rowToTask(r) {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    status: r.status,
    dueDate: r.due_date,
    createdAt: r.created_at
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeTaskType(type) {
  return ["main", "side", "daily"].includes(type) ? type : "daily";
}

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
      : lang === "te"
        ? "Write the entire chronicle in Telugu. Do not translate the player's quest names — keep them exactly as entered. Do not use English words except for XP, HP, and the quest titles."
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

  if (lang === "te") {
    if (total === 0) {
      return `ఈ రోజు ${title} లాగ్‌లో ఏ క్వెస్ట్ కూడా నమోదు కాలేదు — నిశ్శబ్ద మార్గం మరియు ఎదురుచూస్తున్న ఆకాశం మాత్రమే ఉన్నాయి. రాజ్యంలో పెద్ద కదలిక లేకపోయినా, సంకల్ప జ్యోతి ఇంకా వెలుగుతోంది. రేపు ఒక చిన్న క్వెస్ట్ కూడా కొత్త గాథకు ఆరంభం కావచ్చు.`;
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
        ? `గాయాలతోనూ నిలబడి, ${title} ఈ రోజు ${total} క్వెస్ట్${total === 1 ? "" : "‌ల"}తో కఠినమైన రోజును దాటారు.`
        : completionRate === 100
          ? `${title} ఈ రోజు కనిపించిన ప్రతి క్వెస్ట్‌ను జయించి విజయ పతాకం కింద నిలిచారు.`
          : `${title} స్థిరమైన సంకల్పంతో ఈ రోజు ${total} క్వెస్ట్${total === 1 ? "" : "‌లను"} ఎదుర్కొన్నారు.`;
    const progress =
      completed.length > 0
        ? `${completed.length} క్వెస్ట్${completed.length === 1 ? "" : "‌లు"} పూర్తయ్యాయి, అందులో ${completedNames} ఉన్నాయి.`
        : "ఏ క్వెస్ట్ పూర్తికాలేదు, కానీ ప్రయత్నం నేర్పిన పాఠం లాగ్‌లో నమోదైంది.";
    const losses =
      abandoned.length > 0
        ? `${abandoned.length} మార్గ${abandoned.length === 1 ? "ం" : "ాలు"} విడిచిపెట్టబడ్డాయి — ${abandonedNames} వెనుక మిగిలాయి.`
        : active.length > 0
          ? `${active.length} క్వెస్ట్${active.length === 1 ? "" : "‌లు"} రేపటి అంచున ఇంకా మెరిసుతున్నాయి.`
          : "ఏ క్వెస్ట్ వదిలివేయబడలేదు; రోజు స్వచ్ఛమైన ఖడ్గంలా ముగిసింది.";
    const streakLine =
      streak >= 7
        ? `${streak} రోజుల జ్వలించే వరుస కృషి కథకుడి స్వరాన్ని గర్జనలా మార్చింది.`
        : streak >= 3
          ? `${streak} రోజుల జ్యోతి మరింత ప్రకాశించి, ప్రతి విజయానికి అదనపు బలం ఇచ్చింది.`
          : "ఈ జ్యోతి ఇంకా కొత్తదే, కానీ ప్రతి రోజు చేసే కార్యం దాన్ని మరింత పెంచుతుంది.";
    const closing =
      hp <= 35
        ? "ఇప్పుడు విశ్రాంతి తీసుకోండి, కవచాన్ని సరిచేసుకోండి, గాయాలకంటే పదునుగా తిరిగి రండి."
        : "సంపాదించిన అనుభవంతో ఈ క్రానికల్ ముగుస్తుంది; మరో ఉదయం ద్వారం వద్ద ఎదురుచూస్తోంది.";
    return `${opening} ${progress} ${losses} ${streakLine} ${closing}`;
  }

  // English
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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Questlog backend is running.");
});

app.get("/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY created_at ASC");
    res.json(rows.map(rowToTask));
  } catch (err) {
    console.error("GET /tasks error:", err.message);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

app.post("/tasks", async (req, res) => {
  const { title, type, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }
  const newTask = {
    id: Date.now().toString(),
    title: String(title).trim(),
    type: normalizeTaskType(type),
    status: "active",
    dueDate: dueDate ? String(dueDate) : null,
    createdAt: new Date().toISOString()
  };
  try {
    await pool.query(
      "INSERT INTO tasks (id, title, type, status, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [newTask.id, newTask.title, newTask.type, newTask.status, newTask.dueDate, newTask.createdAt]
    );
    res.status(201).json(newTask);
  } catch (err) {
    console.error("POST /tasks error:", err.message);
    res.status(500).json({ error: "Failed to create task." });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { status, dueDate } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Task not found." });
    }
    await pool.query(
      `UPDATE tasks SET
        status   = COALESCE($1, status),
        due_date = CASE WHEN $2::boolean THEN $3 ELSE due_date END
       WHERE id = $4`,
      [status || null, dueDate !== undefined, dueDate ? String(dueDate) : null, req.params.id]
    );
    const { rows: updated } = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      req.params.id
    ]);
    res.json(rowToTask(updated[0]));
  } catch (err) {
    console.error("PUT /tasks/:id error:", err.message);
    res.status(500).json({ error: "Failed to update task." });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Task not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err.message);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

// ── Chronicle route ───────────────────────────────────────────────────────────
app.post("/chronicle", async (req, res) => {
  const { tasks, gameState, demoMode, lang = "en" } = req.body;

  if (demoMode) {
    return res.json({ story: mockChronicle(tasks || [], gameState || {}, lang) });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.json({ story: mockChronicle(tasks || [], gameState || {}, lang) });
  }

  try {
    const prompt = buildChroniclePrompt(tasks || [], gameState || {}, lang);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.85
      })
    });

    if (!response.ok) {
      console.error("Groq error:", await response.text());
      return res.json({ story: mockChronicle(tasks || [], gameState || {}, lang) });
    }

    const data = await response.json();
    const story =
      data.choices?.[0]?.message?.content?.trim() ||
      mockChronicle(tasks || [], gameState || {}, lang);
    res.json({ story });
  } catch (err) {
    console.error("Chronicle generation failed:", err.message);
    res.json({ story: mockChronicle(tasks || [], gameState || {}, lang) });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  await initDb();
  return app.listen(PORT, HOST, () => {
    console.log(`Backend running at http://${HOST}:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  });
}

module.exports = {
  app,
  buildChroniclePrompt,
  initDb,
  mockChronicle,
  normalizeTaskType,
  start
};
