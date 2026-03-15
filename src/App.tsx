import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

// ─── Session ──────────────────────────────────────────────────────────────────
function getSessionId(): string {
  const key = 'skillgap_session'
  let id = localStorage.getItem(key)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, id)
  }
  return id
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ApiSkill = { id: string; slug: string; label: string }

type ApiOption = { id: string; label: string; score: number }
type ApiQuestion = { id: string; text: string; order: number; options: ApiOption[] }
type ApiSkillWithQuiz = ApiSkill & { questions: ApiQuestion[] }

type Level = 'Junior' | 'Middle' | 'Strong Middle'

type ApiRepo = { name: string; url: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLevel(percent: number): Level {
  if (percent < 45) return 'Junior'
  if (percent < 75) return 'Middle'
  return 'Strong Middle'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Remote data ──────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<ApiSkill[]>([])
  const [quiz, setQuiz] = useState<ApiSkillWithQuiz[]>([])
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({}) // questionId → score
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [roadmaps, setRoadmaps] = useState<
    { slug: string; label: string; level: Level; repos: ApiRepo[] }[]
  >([])
  const savedRef = useRef(false)

  // ── Load skills on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/skills`)
      .then((r) => r.json())
      .then((data: ApiSkill[]) => setSkills(data))
      .catch(() => setFetchError('Не вдалось завантажити скіли з сервера'))
      .finally(() => setLoadingSkills(false))
  }, [])

  // ── Load quiz when user clicks "Start" ───────────────────────────────────
  const handleStart = async () => {
    if (selectedSlugs.length === 0) return
    setLoadingQuiz(true)
    setFetchError(null)
    try {
      const allData: ApiSkillWithQuiz[] = []
      for (const slug of selectedSlugs) {
        const r = await fetch(`${API_URL}/api/quiz?skillSlug=${slug}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data: ApiSkillWithQuiz[] = await r.json()
        allData.push(...data)
      }
      setQuiz(allData)
      setStarted(true)
    } catch {
      setFetchError('Не вдалось завантажити питання')
    } finally {
      setLoadingQuiz(false)
    }
  }

  // ── Derived quiz state ────────────────────────────────────────────────────
  const allQuestions = useMemo(() => quiz.flatMap((s) => s.questions), [quiz])

  const isQuizComplete =
    allQuestions.length > 0 && allQuestions.every((q) => answers[q.id] !== undefined)

  const skillStats = useMemo(() => {
    return quiz.map((skill) => {
      const skillMax = skill.questions.length * 5
      const skillTotal = skill.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
      const skillPercent = skillMax > 0 ? Math.round((skillTotal / skillMax) * 100) : 0
      return { slug: skill.slug, label: skill.label, skillPercent, level: getLevel(skillPercent) }
    })
  }, [quiz, answers])

  const overallPercent = useMemo(() => {
    if (allQuestions.length === 0) return 0
    const total = allQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
    return Math.round((total / (allQuestions.length * 5)) * 100)
  }, [allQuestions, answers])

  // ── Save results + fetch repos when quiz complete ─────────────────────────
  useEffect(() => {
    if (!isQuizComplete || savedRef.current) return
    savedRef.current = true
    setSaving(true)
    setSaveError(null)

    const sessionId = getSessionId()
    const results = skillStats.map((s) => ({
      skillSlug: s.slug,
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
        return r.json() as Promise<{ results: { skillSlug: string; level: string; repos: ApiRepo[] }[] }>
      })
      .then(({ results: saved }) => {
        const maps = saved.map((s) => {
          const stat = skillStats.find((st) => st.slug === s.skillSlug)
          return {
            slug: s.skillSlug,
            label: stat?.label ?? s.skillSlug,
            level: (s.level as Level) ?? stat?.level ?? 'Junior',
            repos: s.repos ?? [],
          }
        })
        setRoadmaps(maps)
      })
      .catch((err: unknown) => {
        console.error('Failed to save results:', err)
        setSaveError('Не вдалось зберегти результати на сервері')
      })
      .finally(() => setSaving(false))
  }, [isQuizComplete, skillStats])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleSkill = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const resetAll = () => {
    setStarted(false)
    setAnswers({})
    setSelectedSlugs([])
    setQuiz([])
    setSaving(false)
    setSaveError(null)
    setRoadmaps([])
    savedRef.current = false
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fff1d6_0%,#fde7d1_35%,#f7f6f3_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── Header ── */}
        <header className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur md:p-10">
          <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            SkillGap AI • Main Page
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            Обери скіли, пройди квіз, отримай персональний roadmap
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
            Оціни свій рівень по обраних технологіях. Після квізу визначаємо рівень і показуємо
            реальні GitHub-репозиторії для навчання: 20 для Junior, 30 для Middle/Strong Middle.
          </p>
        </header>

        {/* ── Step 1: Select Skills ── */}
        {!started && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">1) Обери скіли</h2>

            {loadingSkills && (
              <p className="mt-4 animate-pulse text-sm text-slate-400">Завантаження скілів…</p>
            )}

            {fetchError && !loadingSkills && (
              <p className="mt-4 text-sm text-red-500">{fetchError}</p>
            )}

            {!loadingSkills && !fetchError && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => {
                    const active = selectedSlugs.includes(skill.slug)
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.slug)}
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
                    onClick={handleStart}
                    disabled={selectedSlugs.length === 0 || loadingQuiz}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loadingQuiz ? 'Завантаження…' : 'Почати квіз'}
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Очистити
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* ── Step 2: Quiz ── */}
        {started && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold md:text-2xl">2) Квіз по обраних скілах</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Відповідай на питання. Прогрес: {Object.keys(answers).length}/{allQuestions.length}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                ← Назад
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {quiz.map((skillData) => (
                <div key={skillData.id}>
                  <h3 className="mb-3 text-base font-extrabold uppercase tracking-[0.12em] text-cyan-700">
                    {skillData.label}
                  </h3>
                  <div className="space-y-4">
                    {skillData.questions.map((q) => (
                      <article key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="text-base font-bold">{q.text}</h4>
                        <div className="mt-3 grid gap-2">
                          {q.options.map((opt) => (
                            <label
                              key={opt.id}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-cyan-300"
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={answers[q.id] === opt.score}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))
                                }
                                className="h-4 w-4 accent-cyan-600"
                              />
                              <span className="text-sm text-slate-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Step 3: Results ── */}
        {started && isQuizComplete && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-bold md:text-2xl">3) Результат і roadmap</h2>
              <div className="flex gap-3 items-center">
                {saving && (
                  <span className="text-xs animate-pulse text-slate-400">Зберігаємо…</span>
                )}
                {!saving && !saveError && (
                  <span className="text-xs text-green-600">✓ Збережено в БД</span>
                )}
                {saveError && <span className="text-xs text-red-500">{saveError}</span>}
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Пройти ще раз
                </button>
              </div>
            </div>

            {/* Overall stats */}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Загальний score</p>
                <p className="mt-2 text-3xl font-black">{overallPercent}%</p>
              </div>
              <div className="rounded-2xl bg-cyan-600 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.15em] text-cyan-100">Рівень</p>
                <p className="mt-2 text-3xl font-black">{getLevel(overallPercent)}</p>
              </div>
              <div className="rounded-2xl bg-amber-500 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.15em] text-amber-900/80">Скілів перевірено</p>
                <p className="mt-2 text-3xl font-black">{skillStats.length}</p>
              </div>
            </div>

            {/* Per-skill stats */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skillStats.map((s) => (
                <div key={s.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-black">{s.skillPercent}%</p>
                  <p className="mt-1 text-sm text-slate-600">{s.level}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${s.skillPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Roadmaps */}
            {roadmaps.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold">Roadmap репозиторії</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {roadmaps.map((item) => (
                    <article key={item.slug} className="rounded-2xl border border-slate-200 p-4">
                      <h4 className="text-base font-extrabold">
                        {item.label}
                        <span className="ml-2 text-xs font-medium text-slate-500">
                          ({item.level} · {item.repos.length} repos)
                        </span>
                      </h4>
                      {item.repos.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-400 italic">Репо ще не додані</p>
                      ) : (
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
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

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