import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'

const API_URL = 'http://localhost:4000'

// ── Game constants ────────────────────────────────────────────────────────────
const XP_REWARD = { main: 45, side: 30, daily: 20 }
const HP_DAMAGE = { main: 25, side: 15, daily: 10 }
const BASE_MAX_HP = 100
const LEVELS = [
  { id: 'wanderer', xp: 0 },
  { id: 'scout', xp: 100 },
  { id: 'adventurer', xp: 250 },
  { id: 'knight', xp: 450 },
  { id: 'champion', xp: 700 },
  { id: 'legend', xp: 1000 },
  { id: 'mythic', xp: 1400 },
]
const BADGES = [
  { id: 'first-blood' },
  { id: 'perfect-day' },
  { id: 'survivor' },
  { id: 'strategist' },
  { id: 'ghost' },
  { id: 'chronicler' },
  { id: 'variety-hero' },
  { id: 'on-fire' },
  { id: 'unstoppable' },
  { id: 'centurion' },
  { id: 'creature-of-habit' },
  { id: 'punctual' },
]

// ── Equipment ────────────────────────────────────────────────────────────────
// Slot order matches the visual sprite overlays (helmet / cape / shield) plus
// later unlocks (staff, crown, cape-upgrade).
const EQUIPMENT = [
  { id: 'helmet', icon: '⛑️', bonus: { maxHp: 5 } },
  { id: 'sword', icon: '🗡️', bonus: { xpMult: 0.1 } },
  { id: 'shield', icon: '🛡️', bonus: { hpReduction: 5 } },
  { id: 'staff', icon: '🪄', bonus: { xpMult: 0.15 }, requiresLevel: 4 },
  { id: 'crown', icon: '👑', bonus: { maxHp: 10 }, requiresLevel: 5 },
  {
    id: 'cape',
    icon: '🧥',
    bonus: { hpReduction: 10 },
    requiresCompletions: 100,
  },
]

const DEFAULT_GAME = {
  hp: 100,
  xp: 0,
  streak: 0,
  badges: [],
  chronicleCount: 0,
  totalCompletions: 0,
  totalAbandons: 0,
  completedTypeCounts: { main: 0, side: 0, daily: 0 },
  equipped: ['helmet', 'sword', 'shield'],
  earnedPunctual: false,
  chronicleHistory: [],
}
const DEFAULT_SETTINGS = { apiKey: '', demoMode: true }
const MAX_HISTORY_ENTRIES = 20

// ── Helpers ───────────────────────────────────────────────────────────────────
function readStoredValue(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback
  } catch {
    return fallback
  }
}

function getLevelInfo(xp) {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) index = i
  const current = LEVELS[index]
  const next = LEVELS[index + 1] || current
  const span = Math.max(next.xp - current.xp, 1)
  const progress =
    index === LEVELS.length - 1
      ? 100
      : Math.round(((xp - current.xp) / span) * 100)
  return {
    index,
    id: current.id,
    nextId: next.id,
    nextXp: next.xp,
    progress,
  }
}

function getMultiplier(streak) {
  if (streak >= 7) return 2
  if (streak >= 3) return 1.5
  return 1
}

function getWeather(levelIndex) {
  if (levelIndex >= 6) return ['✨', '⚡', '✨', '⚡']
  if (levelIndex >= 3) return ['🌦️', '🏰', '🌙', '🛡️']
  return ['☁️', '🌤️', '🌧️', '🪵']
}

// Whether an equipment item's unlock requirements are met
function isEquipmentUnlocked(item, levelIndex, totalCompletions) {
  if (item.requiresLevel != null && levelIndex < item.requiresLevel)
    return false
  if (
    item.requiresCompletions != null &&
    totalCompletions < item.requiresCompletions
  )
    return false
  return true
}

// Sum bonuses across equipped + unlocked items
function getEquipmentBonuses(equipped, levelIndex, totalCompletions) {
  return EQUIPMENT.reduce(
    (acc, item) => {
      if (
        equipped.includes(item.id) &&
        isEquipmentUnlocked(item, levelIndex, totalCompletions)
      ) {
        acc.maxHp += item.bonus.maxHp || 0
        acc.xpMult += item.bonus.xpMult || 0
        acc.hpReduction += item.bonus.hpReduction || 0
      }
      return acc
    },
    { maxHp: 0, xpMult: 0, hpReduction: 0 }
  )
}

// Due-date status for a task: null if no dueDate or task isn't active/completed-in-time
function getDueInfo(task) {
  if (!task.dueDate) return null
  const due = new Date(task.dueDate)
  if (Number.isNaN(due.getTime())) return null
  const now = new Date()

  if (task.status === 'completed') {
    return { state: 'done', key: 'completedOnTime' }
  }
  if (task.status === 'abandoned') return null

  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (diffHours < 0) {
    return {
      state: 'urgent',
      key: 'overdue',
      days: Math.max(1, Math.floor(-diffHours / 24)),
    }
  }
  if (diffHours <= 24) {
    return { state: 'warning', key: 'dueToday' }
  }
  return { state: 'ok', key: 'dueIn', days: Math.ceil(diffHours / 24) }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { i18n, t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState('daily')
  const [dueDate, setDueDate] = useState('')
  const [chronicle, setChronicle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('quests')
  const [openHistoryId, setOpenHistoryId] = useState(null)
  const [game, setGame] = useState(() =>
    readStoredValue('questlog-game', DEFAULT_GAME)
  )
  const [settings, setSettings] = useState(() =>
    readStoredValue('questlog-settings', DEFAULT_SETTINGS)
  )
  const [draftSettings, setDraftSettings] = useState(settings)
  const [showSettings, setShowSettings] = useState(false)
  const [levelModal, setLevelModal] = useState(null)
  const [badgeModal, setBadgeModal] = useState(null)

  const level = useMemo(() => getLevelInfo(game.xp), [game.xp])
  const baseMultiplier = getMultiplier(game.streak)
  const weather = getWeather(level.index)
  const language = i18n.resolvedLanguage || 'en'
  const levelTitle = t(`levels.${level.id}`)

  const equipped = useMemo(() => game.equipped || [], [game.equipped])

  const bonuses = useMemo(
    () => getEquipmentBonuses(equipped, level.index, game.totalCompletions),
    [equipped, level.index, game.totalCompletions]
  )
  const maxHp = BASE_MAX_HP + bonuses.maxHp
  const multiplier = baseMultiplier * (1 + bonuses.xpMult)

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length
    const abandoned = tasks.filter((t) => t.status === 'abandoned').length
    const active = tasks.filter((t) => t.status === 'active').length
    const total = tasks.length
    const completionRate =
      total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, abandoned, active, total, completionRate }
  }, [tasks])

  useEffect(() => {
    fetchTasks()
  }, [])
  useEffect(() => {
    localStorage.setItem('questlog-game', JSON.stringify(game))
  }, [game])
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  useEffect(() => {
    localStorage.setItem('questlog-settings', JSON.stringify(settings))
    setDraftSettings(settings)
  }, [settings])

  // ── Auto-abandon overdue quests ────────────────────────────────────────────
  useEffect(() => {
    const checkOverdue = () => {
      tasks.forEach((task) => {
        if (task.status !== 'active' || !task.dueDate) return
        const due = new Date(task.dueDate)
        if (Number.isNaN(due.getTime())) return
        if (Date.now() - due.getTime() > 24 * 60 * 60 * 1000) {
          updateTaskStatus(task.id, 'abandoned')
        }
      })
    }
    checkOverdue()
    const interval = setInterval(checkOverdue, 60 * 1000)
    return () => clearInterval(interval)
  }, [tasks])

  async function fetchTasks() {
    try {
      setError('')
      const r = await fetch(`${API_URL}/tasks`)
      if (!r.ok) throw new Error(t('errors.loadQuests'))
      setTasks(await r.json())
    } catch (err) {
      setError(err.message)
    }
  }

  function evaluateBadges(nextGame, nextTasks) {
    const completed = nextTasks.filter((t) => t.status === 'completed')
    const abandoned = nextTasks.filter((t) => t.status === 'abandoned')
    const hasType = (qt) => nextTasks.some((t) => t.type === qt)
    const completedType = (qt) => completed.some((t) => t.type === qt)
    const earned = new Set(nextGame.badges)

    if (nextGame.totalCompletions >= 1) earned.add('first-blood')
    if (nextGame.hp <= 35) earned.add('survivor')
    if (abandoned.length >= 3 || nextGame.totalAbandons >= 3)
      earned.add('ghost')
    if (nextGame.chronicleCount >= 1) earned.add('chronicler')
    if (nextGame.streak >= 3) earned.add('on-fire')
    if (nextGame.streak >= 7) earned.add('unstoppable')
    if (nextGame.totalCompletions >= 100) earned.add('centurion')
    if (nextGame.completedTypeCounts.daily >= 7) earned.add('creature-of-habit')
    if (nextGame.earnedPunctual) earned.add('punctual')
    if (['main', 'side', 'daily'].every(completedType)) earned.add('strategist')
    if (['main', 'side', 'daily'].every(hasType)) earned.add('variety-hero')
    if (nextTasks.length > 0 && completed.length === nextTasks.length)
      earned.add('perfect-day')

    const newBadges = [...earned].filter((b) => !nextGame.badges.includes(b))
    return { ...nextGame, badges: [...earned], newBadges }
  }

  function commitGame(nextGame, nextTasks) {
    const checked = evaluateBadges(nextGame, nextTasks)
    const { newBadges, ...gameWithoutMeta } = checked
    setGame(gameWithoutMeta)
    if (newBadges.length > 0)
      setBadgeModal(BADGES.find((b) => b.id === newBadges[0]))
  }

  async function addTask(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      setError('')
      const r = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          type,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      })
      if (!r.ok) throw new Error(t('errors.addQuest'))
      const newTask = await r.json()
      const nextTasks = [...tasks, newTask]
      setTasks(nextTasks)
      commitGame(game, nextTasks)
      setTitle('')
      setDueDate('')
      setChronicle('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function updateTaskStatus(id, status) {
    const task = tasks.find((t) => t.id === id)
    if (!task || task.status !== 'active') return
    try {
      setError('')
      const r = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!r.ok) throw new Error(t('errors.updateQuest'))
      const updated = await r.json()
      const nextTasks = tasks.map((t) => (t.id === id ? updated : t))
      const prevLevel = getLevelInfo(game.xp).index
      const gainedXp =
        status === 'completed'
          ? Math.round(XP_REWARD[task.type] * multiplier)
          : 0
      const hpDamage = Math.max(0, HP_DAMAGE[task.type] - bonuses.hpReduction)
      const completedOnTime =
        status === 'completed' &&
        task.dueDate &&
        new Date(task.dueDate).getTime() >= Date.now()
      const nextGame = {
        ...game,
        hp: status === 'abandoned' ? Math.max(0, game.hp - hpDamage) : game.hp,
        xp: game.xp + gainedXp,
        totalCompletions:
          game.totalCompletions + (status === 'completed' ? 1 : 0),
        totalAbandons: game.totalAbandons + (status === 'abandoned' ? 1 : 0),
        completedTypeCounts:
          status === 'completed'
            ? {
                ...game.completedTypeCounts,
                [task.type]: game.completedTypeCounts[task.type] + 1,
              }
            : game.completedTypeCounts,
        earnedPunctual: game.earnedPunctual || completedOnTime,
      }
      const nextLevel = getLevelInfo(nextGame.xp)
      setTasks(nextTasks)
      commitGame(nextGame, nextTasks)
      setChronicle('')
      if (nextLevel.index > prevLevel) setLevelModal(nextLevel)
    } catch (err) {
      setError(err.message)
    }
  }

  async function generateChronicle() {
    const streakEarned = stats.completed > 0
    const nextGame = {
      ...game,
      streak: streakEarned ? game.streak + 1 : 0,
      chronicleCount: game.chronicleCount + 1,
    }
    const checkedGame = evaluateBadges(nextGame, tasks)
    const gameState = {
      ...checkedGame,
      title: levelTitle,
      completionRate: stats.completionRate,
    }
    try {
      setIsLoading(true)
      setError('')
      if (settings.demoMode) await new Promise((r) => setTimeout(r, 900))
      const r = await fetch(`${API_URL}/chronicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          gameState,
          apiKey: settings.apiKey,
          demoMode: settings.demoMode,
          lang: language,
        }),
      })
      if (!r.ok) throw new Error(t('errors.generateChronicle'))
      const data = await r.json()
      setChronicle(data.story)

      const historyEntry = {
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        story: data.story,
        completed: stats.completed,
        total: stats.total,
        streak: nextGame.streak,
        hp: nextGame.hp,
        newBadges: checkedGame.newBadges || [],
        questLog: tasks.map((task) => ({
          title: task.title,
          status: task.status,
        })),
      }
      const nextHistory = [
        historyEntry,
        ...(game.chronicleHistory || []),
      ].slice(0, MAX_HISTORY_ENTRIES)
      commitGame({ ...nextGame, chronicleHistory: nextHistory }, tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleEquip(id) {
    const item = EQUIPMENT.find((e) => e.id === id)
    if (!item || !isEquipmentUnlocked(item, level.index, game.totalCompletions))
      return
    const nextEquipped = equipped.includes(id)
      ? equipped.filter((e) => e !== id)
      : [...equipped, id]
    setGame({ ...game, equipped: nextEquipped })
  }

  function saveSettings(e) {
    e.preventDefault()
    setSettings(draftSettings)
    setShowSettings(false)
  }

  const chronicleHistory = game.chronicleHistory || []

  return (
    <main className={`game-shell level-${level.index}`}>
      {/* ── Top Nav ── */}
      <header className="top-bar">
        <div className="brand">
          <div className="brand-coin">⚔</div>
          <h1 className="pixel">{t('app.name')}</h1>
        </div>
        <div className="top-bar-right">
          <LanguageSwitcher />
          <button
            className="icon-button"
            type="button"
            onClick={() => setShowSettings(true)}
          >
            {t('settings.button')}
          </button>
        </div>
      </header>

      <div className="page-body">
        {/* ── Main column ── */}
        <div className="main-column">
          {/* Hero banner */}
          <div className="hero-banner">
            <div className="weather-line">{weather.join(' ')}</div>
            <p className="pixel-kicker">{t('hero.kicker')}</p>
            <h2>{t('hero.tagline')}</h2>
          </div>

          {/* Tabs */}
          <nav className="tab-bar">
            <button
              className={activeTab === 'quests' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('quests')}
            >
              {t('tabs.quests')}
            </button>
            <button
              className={activeTab === 'badges' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('badges')}
            >
              {t('tabs.badgesWithCount', { count: game.badges.length })}
            </button>
            <button
              className={activeTab === 'equipment' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('equipment')}
            >
              {t('tabs.equipment')}
            </button>
            <button
              className={activeTab === 'history' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('history')}
            >
              {t('tabs.historyWithCount', { count: chronicleHistory.length })}
            </button>
          </nav>

          {error && <p className="error-message">{error}</p>}

          {activeTab === 'quests' && (
            <>
              <form className="quest-form" onSubmit={addTask}>
                <input
                  aria-label={t('form.titleAriaLabel')}
                  placeholder={t('form.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <select
                  aria-label={t('form.typeAriaLabel')}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="main">{t('questTypes.main')}</option>
                  <option value="side">{t('questTypes.side')}</option>
                  <option value="daily">{t('questTypes.daily')}</option>
                </select>
                <input
                  type="datetime-local"
                  aria-label={t('form.dueDateAriaLabel')}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <button type="submit">{t('form.addQuest')}</button>
              </form>

              <section className="stats-grid" aria-label={t('stats.ariaLabel')}>
                <article>
                  <span>{stats.total}</span>
                  <p>{t('stats.total')}</p>
                </article>
                <article>
                  <span>{stats.completed}</span>
                  <p>{t('stats.completed')}</p>
                </article>
                <article>
                  <span>{stats.abandoned}</span>
                  <p>{t('stats.abandoned')}</p>
                </article>
                <article>
                  <span>{stats.completionRate}%</span>
                  <p>{t('stats.rate')}</p>
                </article>
              </section>

              <div className="content-grid">
                <div
                  className="quest-list"
                  aria-label={t('quests.listAriaLabel')}
                >
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <h2>{t('empty.title')}</h2>
                      <p>{t('empty.body')}</p>
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const due = getDueInfo(task)
                      const hpLoss = Math.max(
                        0,
                        HP_DAMAGE[task.type] - bonuses.hpReduction
                      )
                      return (
                        <article
                          className={`quest-card ${task.status} ${
                            due ? due.state : ''
                          }`}
                          key={task.id}
                        >
                          <div className="quest-copy">
                            <div className="quest-top">
                              <span className={`type-pill ${task.type}`}>
                                {t(`questTypes.${task.type}`)}
                              </span>
                              {due && (
                                <span className={`due-badge ${due.state}`}>
                                  {due.key === 'overdue' &&
                                    t('dueDates.overdue', { days: due.days })}
                                  {due.key === 'dueToday' &&
                                    t('dueDates.dueToday')}
                                  {due.key === 'dueIn' &&
                                    t('dueDates.dueIn', { days: due.days })}
                                  {due.key === 'completedOnTime' &&
                                    t('dueDates.completedOnTime')}
                                </span>
                              )}
                            </div>
                            <h2>{task.title}</h2>
                            <p>{t(`status.${task.status}`)}</p>
                            {due && due.state === 'urgent' && (
                              <p className="hp-loss">
                                {t('dueDates.autoAbandonNote', { hp: hpLoss })}
                              </p>
                            )}
                            {due && due.state === 'warning' && (
                              <p className="hp-loss">
                                {t('dueDates.expiresNote', { hp: hpLoss })}
                              </p>
                            )}
                          </div>
                          {task.status === 'active' && (
                            <div className="quest-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(task.id, 'completed')
                                }
                              >
                                {t('actions.complete', {
                                  xp: Math.round(
                                    XP_REWARD[task.type] * multiplier
                                  ),
                                })}
                              </button>
                              <button
                                className="danger-button"
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(task.id, 'abandoned')
                                }
                              >
                                {t('actions.abandon', { hp: hpLoss })}
                              </button>
                            </div>
                          )}
                        </article>
                      )
                    })
                  )}
                </div>

                <aside className="chronicle-panel">
                  <p className="pixel-kicker">{t('chronicle.kicker')}</p>
                  <h2>{t('chronicle.title')}</h2>
                  <p>{t('chronicle.description')}</p>
                  <button
                    type="button"
                    onClick={generateChronicle}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t('chronicle.generating')
                      : t('chronicle.generate')}
                  </button>
                  {chronicle && <blockquote>{chronicle}</blockquote>}
                </aside>
              </div>
            </>
          )}

          {activeTab === 'badges' && (
            <section className="badge-wall">
              {BADGES.map((badge) => {
                const earned = game.badges.includes(badge.id)
                return (
                  <article
                    className={`badge-card ${earned ? 'earned' : 'locked'}`}
                    key={badge.id}
                  >
                    <span>{earned ? '🏅' : '🔒'}</span>
                    <h2>{t(`badges.${badge.id}.name`)}</h2>
                    <p>{t(`badges.${badge.id}.hint`)}</p>
                  </article>
                )
              })}
            </section>
          )}

          {activeTab === 'equipment' && (
            <section className="equipment-layout">
              <div className="hero-stage">
                <div className="sprite-wrap">
                  {equipped.includes('helmet') && <div className="eq-helmet" />}
                  {equipped.includes('cape') &&
                    isEquipmentUnlocked(
                      EQUIPMENT.find((e) => e.id === 'cape'),
                      level.index,
                      game.totalCompletions
                    ) && <div className="eq-cape" />}
                  {equipped.includes('shield') && <div className="eq-shield" />}
                  <div className="hero-body" />
                </div>
                <div>
                  <p className="hero-name">{t('profile.name')}</p>
                  <p className="hero-title">⚔ {levelTitle}</p>
                </div>
                <div className="sprite-note">{t('equipment.spriteNote')}</div>
              </div>

              <div className="eq-right">
                <div className="eq-slots">
                  {EQUIPMENT.map((item) => {
                    const unlocked = isEquipmentUnlocked(
                      item,
                      level.index,
                      game.totalCompletions
                    )
                    const isEquipped = unlocked && equipped.includes(item.id)
                    let reqText = ''
                    if (!unlocked) {
                      reqText =
                        item.requiresLevel != null
                          ? t('equipment.requiresLevel', {
                              level: t(
                                `levels.${LEVELS[item.requiresLevel].id}`
                              ),
                            })
                          : t('equipment.requiresCompletions', {
                              count: item.requiresCompletions,
                            })
                    } else {
                      reqText = t(`equipment.items.${item.id}.bonus`)
                    }
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`eq-slot ${isEquipped ? 'equipped' : ''} ${
                          unlocked ? '' : 'locked'
                        }`}
                        disabled={!unlocked}
                        onClick={() => toggleEquip(item.id)}
                      >
                        <span className="eq-slot-icon">{item.icon}</span>
                        <span className="eq-slot-name">
                          {t(`equipment.items.${item.id}.name`)}
                        </span>
                        <span className="eq-slot-req">{reqText}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="eq-bonus-bar">
                  <div className="pixel-kicker eq-bonus-title">
                    {t('equipment.activeBonuses')}
                  </div>
                  <div className="eq-bonus">
                    <span className="eq-bonus-icon">❤️</span>
                    <span className="eq-bonus-label">
                      {t('equipment.bonus.maxHp')}
                    </span>
                    <span className="eq-bonus-val">+{bonuses.maxHp}</span>
                  </div>
                  <div className="eq-bonus">
                    <span className="eq-bonus-icon">⭐</span>
                    <span className="eq-bonus-label">
                      {t('equipment.bonus.xpMult')}
                    </span>
                    <span className="eq-bonus-val">
                      +{Math.round(bonuses.xpMult * 100)}%
                    </span>
                  </div>
                  <div className="eq-bonus">
                    <span className="eq-bonus-icon">🛡️</span>
                    <span className="eq-bonus-label">
                      {t('equipment.bonus.hpReduction')}
                    </span>
                    <span className="eq-bonus-val">-{bonuses.hpReduction}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="chronicle-history">
              {chronicleHistory.length === 0 ? (
                <div className="empty-state">
                  <h2>{t('history.emptyTitle')}</h2>
                  <p>{t('history.emptyBody')}</p>
                </div>
              ) : (
                chronicleHistory.map((entry) => {
                  const open = openHistoryId === entry.id
                  const rate =
                    entry.total === 0
                      ? 0
                      : Math.round((entry.completed / entry.total) * 100)
                  const completedClass =
                    rate >= 70 ? 'good' : rate >= 40 ? 'warn' : 'crit'
                  const hpClass =
                    entry.hp > 60 ? 'good' : entry.hp > 35 ? 'warn' : 'crit'
                  return (
                    <article
                      className={`chronicle-entry ${open ? 'open' : ''}`}
                      key={entry.id}
                    >
                      <button
                        type="button"
                        className="chronicle-header"
                        onClick={() => setOpenHistoryId(open ? null : entry.id)}
                      >
                        <div className="chronicle-meta">
                          <span className="chronicle-date">
                            {new Date(entry.date).toLocaleDateString(language, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <div className="chronicle-stats">
                            <span className={`c-stat ${completedClass}`}>
                              {t('history.questCount', {
                                completed: entry.completed,
                                total: entry.total,
                              })}
                            </span>
                            <span className="c-stat">
                              {t('history.streakStat', {
                                streak: entry.streak,
                              })}
                            </span>
                            <span className={`c-stat ${hpClass}`}>
                              {t('history.hpStat', { hp: entry.hp })}
                            </span>
                          </div>
                        </div>
                        <span className="chronicle-chevron">▼</span>
                      </button>
                      <div className="chronicle-body">
                        <p className="chronicle-text">{entry.story}</p>
                        <hr className="divider" />
                        <div className="chronicle-quest-log">
                          {entry.questLog.map((q, i) => (
                            <span
                              className={`cq-tag ${
                                q.status === 'completed' ? 'done' : 'fail'
                              }`}
                              key={i}
                            >
                              {q.status === 'completed' ? '✓' : '✗'} {q.title}
                            </span>
                          ))}
                          {entry.newBadges.map((badgeId) => (
                            <span className="chronicle-new-badge" key={badgeId}>
                              {t('history.newBadge', {
                                badge: t(`badges.${badgeId}.name`),
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="profile-card">
            <div className="profile-top">
              <div className="hero-sprite" aria-hidden="true" />
              <div>
                <p className="profile-name">{t('profile.name')}</p>
                <p className="profile-level">{levelTitle}</p>
              </div>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat">
                <span className="stat-icon">⭐</span>
                <div>
                  <span className="stat-value">{game.xp}</span>
                  <span className="stat-label">{t('profile.stats.xp')}</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">🏅</span>
                <div>
                  <span className="stat-value">{game.badges.length}</span>
                  <span className="stat-label">
                    {t('profile.stats.badges')}
                  </span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">🔥</span>
                <div>
                  <span className="stat-value">{game.streak}</span>
                  <span className="stat-label">
                    {t('profile.stats.streak')}
                  </span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">⚔️</span>
                <div>
                  <span className="stat-value">{game.totalCompletions}</span>
                  <span className="stat-label">
                    {t('profile.stats.completed')}
                  </span>
                </div>
              </div>
            </div>

            <button className="wide-button" type="button">
              {t('profile.view')}
            </button>
          </div>

          {/* HP */}
          <article
            className={`hud-card hp-card ${game.hp <= 35 ? 'critical' : ''}`}
          >
            <div className="hud-label">
              <span>{t('hud.hp')}</span>
              <strong>
                {game.hp}/{maxHp}
              </strong>
            </div>
            <div className="meter">
              <span style={{ width: `${(game.hp / maxHp) * 100}%` }} />
            </div>
          </article>

          {/* XP / Level */}
          <article className="hud-card">
            <div className="hud-label">
              <span>{levelTitle}</span>
              <strong>{t('hud.xpValue', { xp: game.xp })}</strong>
            </div>
            <div className="meter xp-meter">
              <span style={{ width: `${level.progress}%` }} />
            </div>
            <small>
              {level.index === LEVELS.length - 1
                ? t('hud.maxTitle')
                : t('hud.xpToNext', {
                    xp: level.nextXp - game.xp,
                    title: t(`levels.${level.nextId}`),
                  })}
            </small>
          </article>

          {/* Streak */}
          <article className="hud-card streak-card">
            <span>🔥 {game.streak}</span>
            <p>{t('hud.multiplier', { multiplier: multiplier.toFixed(2) })}</p>
          </article>
        </aside>
      </div>

      {/* ── Settings modal ── */}
      {showSettings && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card settings-card" onSubmit={saveSettings}>
            <h2>{t('settings.title')}</h2>
            <label>
              {t('settings.apiKeyLabel')}
              <input
                type="password"
                value={draftSettings.apiKey}
                placeholder={t('settings.apiKeyPlaceholder')}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, apiKey: e.target.value })
                }
              />
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={draftSettings.demoMode}
                onChange={(e) =>
                  setDraftSettings({
                    ...draftSettings,
                    demoMode: e.target.checked,
                  })
                }
              />
              {t('settings.mockLabel')}
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="plain-button"
                onClick={() => setShowSettings(false)}
              >
                {t('settings.cancel')}
              </button>
              <button type="submit">{t('settings.save')}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Level-up modal ── */}
      {levelModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <p className="pixel-kicker">{t('levelUp.kicker')}</p>
            <h2>{t(`levels.${levelModal.id}`)}</h2>
            <p>{t('levelUp.body')}</p>
            <button type="button" onClick={() => setLevelModal(null)}>
              {t('levelUp.continue')}
            </button>
          </div>
        </div>
      )}

      {/* ── Badge modal ── */}
      {badgeModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <p className="pixel-kicker">{t('badgeModal.kicker')}</p>
            <h2>🏅 {t(`badges.${badgeModal.id}.name`)}</h2>
            <p>{t(`badges.${badgeModal.id}.hint`)}</p>
            <button type="button" onClick={() => setBadgeModal(null)}>
              {t('badgeModal.claim')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
