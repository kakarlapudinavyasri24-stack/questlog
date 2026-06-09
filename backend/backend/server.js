const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./db.json";

// helper
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// INIT DB
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ tasks: [] }));
}

// GET TASKS
app.get("/tasks", (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

// ADD TASK
app.post("/tasks", (req, res) => {
  const db = readDB();
  const newTask = {
    id: Date.now(),
    title: req.body.title,
    type: req.body.type,
    status: "active",
  };

  db.tasks.push(newTask);
  writeDB(db);

  res.json(newTask);
});

// UPDATE TASK STATUS
app.put("/tasks/:id", (req, res) => {
  const db = readDB();

  db.tasks = db.tasks.map((t) =>
    t.id == req.params.id ? { ...t, status: req.body.status } : t
  );

  writeDB(db);
  res.json({ success: true });
});

// CHRONICLE (MOCK AI OR READY FOR CLAUDE)
app.post("/chronicle", (req, res) => {
  const { tasks } = req.body;

  const completed = tasks.filter((t) => t.status === "completed");
  const abandoned = tasks.filter((t) => t.status === "abandoned");

  const story = `
Today began with purpose. The user set out on ${tasks.length} quests.

${completed.length} quests were completed, marking progress and achievement.

${abandoned.length > 0
    ? `Some quests were left behind, becoming unfinished echoes of the day.`
    : `No quests were abandoned, the journey remained steady.`}

By the end of the day, the story of effort and intent was written.
  `;

  res.json({ chronicle: story });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});