import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const QUEST_TYPES = { main: "Main quest", side: "Side quest", daily: "Daily quest" };
const XP_REWARD = { main: 45, side: 30, daily: 20 };
const HP_DAMAGE = { main: 25, side: 15, daily: 10 };
const LEVELS = [
  { title: "Wanderer", xp: 0 },
  { title: "Scout", xp: 100 },
  { title: "Adventurer", xp: 250 },
  { title: "Knight", xp: 450 },
  { title: "Champion", xp: 700 },
  { title: "Legend", xp: 1000 },
  { title: "Mythic", xp: 1400 }
];
const BADGES = [
  { id: "first-blood", name: "First Blood", hint: "Complete your first quest." },
  { id: "perfect-day", name: "Perfect Day", hint: "End a day with every quest completed." },
  { id: "survivor", name: "Survivor", hint: "Keep going at critical HP." },
  { id: "strategist", name: "Strategist", hint: "Complete a main, side, and daily quest." },
  { id: "ghost", name: "Ghost", hint: "Abandon 3 quests." },
  { id: "chronicler", name: "Chronicler", hint: "Generate your first Chronicle." },
  { id: "variety-hero", name: "Variety Hero", hint: "Log all three quest types." },
  { id: "on-fire", name: "On Fire", hint: "Reach a 3-day streak." },
  { id: "unstoppable", name: "Unstoppable", hint: "Reach a 7-day streak." },
  { id: "centurion", name: "Centurion", hint: "Complete 100 quests." },
  { id: "creature-of-habit", name: "Creature of Habit", hint: "Complete 7 daily quests." }
];
const DEFAULT_GAME = {
  hp: 100,
  xp: 0,
  streak: 0,
  badges: [],
  chronicleCount: 0,
  totalCompletions: 0,
  totalAbandons: 0,
  completedTypeCounts: { main: 0, side: 0, daily: 0 }
};
const DEFAULT_SETTINGS = { apiKey: "", demoMode: true };

function readStoredValue(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch {
    return fallback;
  }
}

function getLevelInfo(xp) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) index = i;
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || current;
  const span = Math.max(next.xp - current.xp, 1);
  const progress = index === LEVELS.length - 1 ? 100 : Math.round(((xp - current.xp) / span) * 100);
  return { index, title: current.title, nextTitle: next.title, nextXp: next.xp, progress };
}

function getMultiplier(streak) {
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function getWeather(levelIndex) {
  if (levelIndex >= 6) return ["✨", "⚡", "✨", "⚡"];
  if (levelIndex >= 3) return ["🌦️", "🏰", "🌙", "🛡️"];
  return ["☁️", "🌤️", "🌧️", "🪵"];
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("daily");
  const [chronicle, setChronicle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("quests");
  const [game, setGame] = useState(() => readStoredValue("questlog-game", DEFAULT_GAME));
  const [settings, setSettings] = useState(() =>
    readStoredValue("questlog-settings", DEFAULT_SETTINGS)
  );
  const [draftSettings, setDraftSettings] = useState(settings);
  const [showSettings, setShowSettings] = useState(false);
  const [levelModal, setLevelModal] = useState(null);
  const [badgeModal, setBadgeModal] = useState(null);

  const level = useMemo(() => getLevelInfo(game.xp), [game.xp]);
  const multiplier = getMultiplier(game.streak);
  const weather = getWeather(level.index);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "completed").length;
    const abandoned = tasks.filter((t) => t.status === "abandoned").length;
    const active = tasks.filter((t) => t.status === "active").length;
    const total = tasks.length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, abandoned, active, total, completionRate };
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, []);
  useEffect(() => {
    localStorage.setItem("questlog-game", JSON.stringify(game));
  }, [game]);
  useEffect(() => {
    localStorage.setItem("questlog-settings", JSON.stringify(settings));
    setDraftSettings(settings);
  }, [settings]);

  async function fetchTasks() {
    try {
      setError("");
      const r = await fetch(`${API_URL}/tasks`);
      if (!r.ok) throw new Error("Could not load quests.");
      setTasks(await r.json());
    } catch (err) {
      setError(err.message);
    }
  }

  function evaluateBadges(nextGame, nextTasks) {
    const completed = nextTasks.filter((t) => t.status === "completed");
    const abandoned = nextTasks.filter((t) => t.status === "abandoned");
    const hasType = (qt) => nextTasks.some((t) => t.type === qt);
    const completedType = (qt) => completed.some((t) => t.type === qt);
    const earned = new Set(nextGame.badges);

    if (nextGame.totalCompletions >= 1) earned.add("first-blood");
    if (nextGame.hp <= 35) earned.add("survivor");
    if (abandoned.length >= 3 || nextGame.totalAbandons >= 3) earned.add("ghost");
    if (nextGame.chronicleCount >= 1) earned.add("chronicler");
    if (nextGame.streak >= 3) earned.add("on-fire");
    if (nextGame.streak >= 7) earned.add("unstoppable");
    if (nextGame.totalCompletions >= 100) earned.add("centurion");
    if (nextGame.completedTypeCounts.daily >= 7) earned.add("creature-of-habit");
    if (["main", "side", "daily"].every(completedType)) earned.add("strategist");
    if (["main", "side", "daily"].every(hasType)) earned.add("variety-hero");
    if (nextTasks.length > 0 && completed.length === nextTasks.length) earned.add("perfect-day");

    const newBadges = [...earned].filter((b) => !nextGame.badges.includes(b));
    return { ...nextGame, badges: [...earned], newBadges };
  }

  function commitGame(nextGame, nextTasks) {
    const checked = evaluateBadges(nextGame, nextTasks);
    const { newBadges, ...gameWithoutMeta } = checked;
    setGame(gameWithoutMeta);
    if (newBadges.length > 0) {
      setBadgeModal(BADGES.find((b) => b.id === newBadges[0]));
    }
  }

  async function addTask(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      setError("");
      const r = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, type })
      });
      if (!r.ok) throw new Error("Could not add quest.");
      const newTask = await r.json();
      const nextTasks = [...tasks, newTask];
      setTasks(nextTasks);
      commitGame(game, nextTasks);
      setTitle("");
      setChronicle("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateTaskStatus(id, status) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== "active") return;
    try {
      setError("");
      const r = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!r.ok) throw new Error("Could not update quest.");
      const updated = await r.json();
      const nextTasks = tasks.map((t) => (t.id === id ? updated : t));
      const prevLevel = getLevelInfo(game.xp).index;
      const gainedXp = status === "completed" ? Math.round(XP_REWARD[task.type] * multiplier) : 0;
      const nextGame = {
        ...game,
        hp: status === "abandoned" ? Math.max(0, game.hp - HP_DAMAGE[task.type]) : game.hp,
        xp: game.xp + gainedXp,
        totalCompletions: game.totalCompletions + (status === "completed" ? 1 : 0),
        totalAbandons: game.totalAbandons + (status === "abandoned" ? 1 : 0),
        completedTypeCounts:
          status === "completed"
            ? { ...game.completedTypeCounts, [task.type]: game.completedTypeCounts[task.type] + 1 }
            : game.completedTypeCounts
      };
      const nextLevel = getLevelInfo(nextGame.xp);
      setTasks(nextTasks);
      commitGame(nextGame, nextTasks);
      setChronicle("");
      if (nextLevel.index > prevLevel) setLevelModal(nextLevel);
    } catch (err) {
      setError(err.message);
    }
  }

  async function generateChronicle() {
    const streakEarned = stats.completed > 0;
    const nextGame = {
      ...game,
      streak: streakEarned ? game.streak + 1 : 0,
      chronicleCount: game.chronicleCount + 1
    };
    const checkedGame = evaluateBadges(nextGame, tasks);
    const gameState = { ...checkedGame, title: level.title, completionRate: stats.completionRate };
    try {
      setIsLoading(true);
      setError("");
      if (settings.demoMode) await new Promise((r) => setTimeout(r, 900));
      const r = await fetch(`${API_URL}/chronicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          gameState,
          apiKey: settings.apiKey,
          demoMode: settings.demoMode
        })
      });
      if (!r.ok) throw new Error("Could not generate the Daily Chronicle.");
      const data = await r.json();
      setChronicle(data.story);
      commitGame(nextGame, tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function saveSettings(e) {
    e.preventDefault();
    setSettings(draftSettings);
    setShowSettings(false);
  }

  return (
    <main className={`game-shell level-${level.index}`}>
      {/* ── Top Nav ── */}
      <header className="top-bar">
        <div className="brand">
          <div className="brand-coin">⚔</div>
          <h1 className="pixel">Questlog</h1>
        </div>
        <div className="top-bar-right">
          <button className="icon-button" type="button" onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      <div className="page-body">
        {/* ── Main column ── */}
        <div className="main-column">
          {/* Hero banner */}
          <div className="hero-banner">
            <div className="weather-line">{weather.join(" ")}</div>
            <p className="pixel-kicker">Your adventure awaits</p>
            <h2>Your tasks are already a story.</h2>
            <p>Questlog just tells it.</p>
          </div>

          {/* Tabs */}
          <nav className="tab-bar">
            <button
              className={activeTab === "quests" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("quests")}
            >
              Quests
            </button>
            <button
              className={activeTab === "badges" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("badges")}
            >
              Badges {game.badges.length}/11
            </button>
          </nav>

          {error && <p className="error-message">{error}</p>}

          {activeTab === "quests" ? (
            <>
              <form className="quest-form" onSubmit={addTask}>
                <input
                  aria-label="Quest title"
                  placeholder="Name your quest..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <select
                  aria-label="Quest type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="main">Main quest</option>
                  <option value="side">Side quest</option>
                  <option value="daily">Daily quest</option>
                </select>
                <button type="submit">+ Add Quest</button>
              </form>

              <section className="stats-grid" aria-label="Quest stats">
                <article>
                  <span>{stats.total}</span>
                  <p>Total</p>
                </article>
                <article>
                  <span>{stats.completed}</span>
                  <p>Completed</p>
                </article>
                <article>
                  <span>{stats.abandoned}</span>
                  <p>Abandoned</p>
                </article>
                <article>
                  <span>{stats.completionRate}%</span>
                  <p>Rate</p>
                </article>
              </section>

              <div className="content-grid">
                <div className="quest-list" aria-label="Task list">
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <h2>No quests yet</h2>
                      <p>Write the first task and start the run.</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <article className={`quest-card ${task.status}`} key={task.id}>
                        <div className="quest-copy">
                          <span className={`type-pill ${task.type}`}>{QUEST_TYPES[task.type]}</span>
                          <h2>{task.title}</h2>
                          <p>{task.status}</p>
                        </div>
                        {task.status === "active" && (
                          <div className="quest-actions">
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task.id, "completed")}
                            >
                              +{Math.round(XP_REWARD[task.type] * multiplier)} XP
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={() => updateTaskStatus(task.id, "abandoned")}
                            >
                              -{HP_DAMAGE[task.type]} HP
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>

                <aside className="chronicle-panel">
                  <p className="pixel-kicker">Daily Chronicle</p>
                  <h2>End Day</h2>
                  <p>Uses HP, level, streak, and completion rate to set the narrator tone.</p>
                  <button type="button" onClick={generateChronicle} disabled={isLoading}>
                    {isLoading ? "Writing..." : "Generate Chronicle →"}
                  </button>
                  {chronicle && <blockquote>{chronicle}</blockquote>}
                </aside>
              </div>
            </>
          ) : (
            <section className="badge-wall">
              {BADGES.map((badge) => {
                const earned = game.badges.includes(badge.id);
                return (
                  <article className={`badge-card ${earned ? "earned" : "locked"}`} key={badge.id}>
                    <span>{earned ? "🏅" : "🔒"}</span>
                    <h2>{badge.name}</h2>
                    <p>{badge.hint}</p>
                  </article>
                );
              })}
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="profile-card">
            <div className="profile-top">
              <div className="hero-sprite" aria-hidden="true" />
              <div>
                <p className="profile-name">Hero</p>
                <p className="profile-level">{level.title}</p>
              </div>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat">
                <span className="stat-icon">⭐</span>
                <div>
                  <span className="stat-value">{game.xp}</span>
                  <span className="stat-label">Total XP</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">🏅</span>
                <div>
                  <span className="stat-value">{game.badges.length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">🔥</span>
                <div>
                  <span className="stat-value">{game.streak}</span>
                  <span className="stat-label">Day streak</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">⚔️</span>
                <div>
                  <span className="stat-value">{game.totalCompletions}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>

            <button className="wide-button" type="button">
              View Profile
            </button>
          </div>

          {/* HP */}
          <article className={`hud-card hp-card ${game.hp <= 35 ? "critical" : ""}`}>
            <div className="hud-label">
              <span>HP</span>
              <strong>{game.hp}/100</strong>
            </div>
            <div className="meter">
              <span style={{ width: `${game.hp}%` }} />
            </div>
          </article>

          {/* XP / Level */}
          <article className="hud-card">
            <div className="hud-label">
              <span>{level.title}</span>
              <strong>XP {game.xp}</strong>
            </div>
            <div className="meter xp-meter">
              <span style={{ width: `${level.progress}%` }} />
            </div>
            <small>
              {level.index === LEVELS.length - 1
                ? "Max title reached"
                : `${level.nextXp - game.xp} XP to ${level.nextTitle}`}
            </small>
          </article>

          {/* Streak */}
          <article className="hud-card streak-card">
            <span>🔥 {game.streak}</span>
            <p>{multiplier}x XP multiplier</p>
          </article>
        </aside>
      </div>

      {/* ── Settings modal ── */}
      {showSettings && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card settings-card" onSubmit={saveSettings}>
            <h2>⚙️ Settings</h2>
            <label>
              Claude API Key
              <input
                type="password"
                value={draftSettings.apiKey}
                placeholder="sk-ant-..."
                onChange={(e) => setDraftSettings({ ...draftSettings, apiKey: e.target.value })}
              />
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={draftSettings.demoMode}
                onChange={(e) => setDraftSettings({ ...draftSettings, demoMode: e.target.checked })}
              />
              Use mock chronicle
            </label>
            <div className="modal-actions">
              <button type="button" className="plain-button" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Level-up modal ── */}
      {levelModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <p className="pixel-kicker">Level Up</p>
            <h2>{levelModal.title}</h2>
            <p>Your title has evolved. The world looks a little different now.</p>
            <button type="button" onClick={() => setLevelModal(null)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Badge modal ── */}
      {badgeModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <p className="pixel-kicker">Badge Unlocked</p>
            <h2>🏅 {badgeModal.name}</h2>
            <p>{badgeModal.hint}</p>
            <button type="button" onClick={() => setBadgeModal(null)}>
              Claim
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
