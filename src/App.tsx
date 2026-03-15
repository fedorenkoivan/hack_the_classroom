import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

/** Генеруємо або беремо з localStorage анонімний sessionId */
function getSessionId(): string {
  const key = 'skillgap_session'
  let id = localStorage.getItem(key)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, id)
  }
  return id
}

type Skill = 'js' | 'ts'
type Level = 'Junior' | 'Middle' | 'Strong Middle'

type Question = {
  id: number
  skill: Skill
  text: string
  options: { label: string; score: number }[]
}

const SKILLS: { id: Skill; label: string }[] = [
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
]

const QUIZ: Question[] = [
  {
    id: 1,
    skill: 'js',
    text: 'Наскільки впевнено працюєш з замиканнями (closures)?',
    options: [
      { label: 'Лише чув(ла)', score: 1 },
      { label: 'Розумію теорію', score: 2 },
      { label: 'Використовую інколи', score: 3 },
      { label: 'Використовую регулярно', score: 4 },
      { label: 'Пояснюю іншим + оптимізую', score: 5 },
    ],
  },
  {
    id: 2,
    skill: 'js',
    text: 'Як добре знаєш event loop та async/await?',
    options: [
      { label: 'Базовий рівень', score: 1 },
      { label: 'Можу написати прості async сценарії', score: 2 },
      { label: 'Розрізняю microtask/macrotask', score: 3 },
      { label: 'Дебажу race conditions', score: 4 },
      { label: 'Проєктую складні async-потоки', score: 5 },
    ],
  },
  {
    id: 3,
    skill: 'js',
    text: 'Який твій рівень роботи з масивами/об’єктами та функціональними методами?',
    options: [
      { label: 'for/if тільки', score: 1 },
      { label: 'map/filter/reduce на базовому рівні', score: 2 },
      { label: 'Пишу чистий код без мутацій', score: 3 },
      { label: 'Оптимізую перетворення даних', score: 4 },
      { label: 'Будую reusable утиліти', score: 5 },
    ],
  },
  {
    id: 4,
    skill: 'ts',
    text: 'Наскільки впевнено працюєш з type aliases та interfaces?',
    options: [
      { label: 'Плутаюся', score: 1 },
      { label: 'Використовую для простих моделей', score: 2 },
      { label: 'Розумію різницю і коли що краще', score: 3 },
      { label: 'Створюю гнучкі типи для API', score: 4 },
      { label: 'Пишу архітектурно стійкі типи', score: 5 },
    ],
  },
  {
    id: 5,
    skill: 'ts',
    text: 'Як працюєш з generic-типами?',
    options: [
      { label: 'Майже не використовую', score: 1 },
      { label: 'Читаю, але рідко пишу сам(а)', score: 2 },
      { label: 'Пишу generic функції', score: 3 },
      { label: 'Пишу generic компоненти/хуки', score: 4 },
      { label: 'Комбіную generics, constraints, infer', score: 5 },
    ],
  },
  {
    id: 6,
    skill: 'ts',
    text: 'Наскільки впевнено використовуєш utility types (Pick, Omit, Partial...)?',
    options: [
      { label: 'Знаю кілька назв', score: 1 },
      { label: 'Інколи використовую', score: 2 },
      { label: 'Використовую регулярно', score: 3 },
      { label: 'Комбіную для складних кейсів', score: 4 },
      { label: 'Проєктую свої typed-патерни', score: 5 },
    ],
  },
]

function getLevel(percent: number): Level {
  if (percent < 45) return 'Junior'
  if (percent < 75) return 'Middle'
  return 'Strong Middle'
}

function buildRoadmap(skill: Skill, level: Level) {
  const count = level === 'Junior' ? 20 : 30
  const title = skill === 'js' ? 'JavaScript' : 'TypeScript'
  return Array.from({ length: count }, (_, i) => ({
    name: `${title} Practice Repo #${i + 1}`,
    url: `https://github.com/example/${skill}-${level.toLowerCase().replace(' ', '-')}-repo-${i + 1}`,
  }))
}

export default function App() {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const savedRef = useRef(false) // guard – save once per quiz completion

  const activeQuestions = useMemo(
    () => QUIZ.filter((q) => selectedSkills.includes(q.skill)),
    [selectedSkills]
  )

  const maxScore = activeQuestions.length * 5
  const totalScore = activeQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const level = getLevel(percent)

  const isQuizComplete =
    activeQuestions.length > 0 && activeQuestions.every((q) => answers[q.id] !== undefined)

  const skillStats = useMemo(() => {
    return selectedSkills.map((skill) => {
      const skillQuestions = activeQuestions.filter((q) => q.skill === skill)
      const skillMax = skillQuestions.length * 5
      const skillTotal = skillQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
      const skillPercent = skillMax > 0 ? Math.round((skillTotal / skillMax) * 100) : 0
      return { skill, skillPercent, level: getLevel(skillPercent) as Level }
    })
  }, [selectedSkills, activeQuestions, answers])

  const roadmaps = useMemo(() => {
    return skillStats.map((s) => ({
      skill: s.skill,
      label: s.skill === 'js' ? 'JavaScript' : 'TypeScript',
      repos: buildRoadmap(s.skill, s.level),
      level: s.level,
    }))
  }, [skillStats])

  // ── Зберігаємо результати в БД коли квіз завершено ────────────────────────
  useEffect(() => {
    if (!isQuizComplete || savedRef.current) return
    savedRef.current = true
    setSaving(true)
    setSaveError(null)

    const sessionId = getSessionId()
    const results = skillStats.map((s) => ({
      skillSlug: s.skill,
      score: s.skillPercent,
      level: s.level,
    }))

    fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, results }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
      })
      .catch((err: unknown) => {
        console.error('Failed to save results:', err)
        setSaveError('Не вдалось зберегти результати на сервері')
      })
      .finally(() => setSaving(false))
  }, [isQuizComplete, skillStats])

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const resetAll = () => {
    setStarted(false)
    setAnswers({})
    setSelectedSkills([])
    setSaving(false)
    setSaveError(null)
    savedRef.current = false
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fff1d6_0%,#fde7d1_35%,#f7f6f3_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
          <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            SkillGap AI • Main Page
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Обери скіли, пройди квіз, отримай персональний roadmap
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
            Підтримувані скіли: JavaScript та TypeScript. Після квізу визначаємо рівень і показуємо список
            GitHub-репозиторіїв: 20 для Junior, 30 для Middle/Strong Middle.
          </p>
        </header>

        {!started && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">1) Обери скіли</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SKILLS.map((skill) => {
                const active = selectedSkills.includes(skill.id)
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={[
                      'group rounded-2xl border p-5 text-left transition',
                      active
                        ? 'border-cyan-600 bg-cyan-50 shadow-md'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300',
                    ].join(' ')}
                  >
                    <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Skill</p>
                    <p className="mt-1 text-xl font-extrabold">{skill.label}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {active ? 'Обрано для квізу' : 'Натисни, щоб додати у квіз'}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStarted(true)}
                disabled={selectedSkills.length === 0}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Почати квіз
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Очистити
              </button>
            </div>
          </section>
        )}

        {started && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">2) Квіз по обраних скілах</h2>
            <p className="mt-2 text-sm text-slate-600">
              Відповідай на питання по кожному обраному скілу. Прогрес: {Object.keys(answers).length}/
              {activeQuestions.length}
            </p>

            <div className="mt-6 space-y-4">
              {activeQuestions.map((q) => (
                <article key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{q.skill}</p>
                  <h3 className="mt-1 text-lg font-bold">{q.text}</h3>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.label}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-cyan-300"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === opt.score}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                          className="h-4 w-4 accent-cyan-600"
                        />
                        <span className="text-sm text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {started && isQuizComplete && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold md:text-2xl">3) Результат і roadmap</h2>
              {saving && (
                <span className="text-xs text-slate-400 animate-pulse">Зберігаємо…</span>
              )}
              {!saving && !saveError && isQuizComplete && (
                <span className="text-xs text-green-600">✓ Збережено в БД</span>
              )}
              {saveError && (
                <span className="text-xs text-red-500">{saveError}</span>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Загальний score</p>
                <p className="mt-2 text-3xl font-black">{percent}%</p>
              </div>
              <div className="rounded-2xl bg-cyan-600 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.15em] text-cyan-100">Рівень</p>
                <p className="mt-2 text-3xl font-black">{level}</p>
              </div>
              <div className="rounded-2xl bg-amber-500 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.15em] text-amber-900/80">Репозиторіїв</p>
                <p className="mt-2 text-3xl font-black">
                  {level === 'Junior' ? 20 : 30} / skill
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {roadmaps.map((item) => (
                <article key={item.skill} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-lg font-extrabold">
                    {item.label} roadmap ({item.level})
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Рекомендовані репозиторії: {item.repos.length}
                  </p>
                  <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                    {item.repos.map((repo) => (
                      <li key={repo.url}>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-cyan-700 hover:bg-cyan-50"
                        >
                          {repo.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}