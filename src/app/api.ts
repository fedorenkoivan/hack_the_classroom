/**
 * API client — звертається до бекенду.
 *
 * В dev-режимі Vite проксує /api → http://localhost:4000
 * В production використовується VITE_API_URL з .env
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string
  label: string   // поле у БД називається label
  score: number
}

export interface QuizQuestion {
  id: string
  text: string
  order: number
  options: QuizOption[]
}

export interface QuizSkill {
  id: string
  slug: string
  label: string
  questions: QuizQuestion[]
}

export interface SubmitResult {
  skillSlug: string
  score: number
  level: string
}

export interface SavedSkill {
  skillSlug: string
  label: string
  score: number
  level: string
  repos: { name: string; url: string }[]
}

export interface SubmitResponse {
  userId: string
  skills: SavedSkill[]
}

// ─── Requests ─────────────────────────────────────────────────────────────────

/**
 * Отримати всі скіли з питаннями для квізу.
 * Якщо передати slugs[] — повернуться тільки вибрані.
 */
export async function fetchQuiz(slugs?: string[]): Promise<QuizSkill[]> {
  if (slugs && slugs.length > 0) {
    // Паралельно запитуємо кожен скіл і об'єднуємо
    const results = await Promise.all(
      slugs.map((slug) =>
        fetch(`${BASE}/api/quiz?skillSlug=${encodeURIComponent(slug)}`).then(
          (r) => r.json() as Promise<QuizSkill[]>
        )
      )
    )
    return results.flat()
  }

  const res = await fetch(`${BASE}/api/quiz`)
  if (!res.ok) throw new Error('Failed to fetch quiz')
  return res.json() as Promise<QuizSkill[]>
}

/**
 * Надіслати результати квізу на бекенд.
 * Повертає збережені скіли разом з репозиторіями.
 */
export async function submitResults(
  sessionId: string,
  results: SubmitResult[]
): Promise<SubmitResponse> {
  const res = await fetch(`${BASE}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, results }),
  })
  if (!res.ok) throw new Error('Failed to submit results')
  return res.json() as Promise<SubmitResponse>
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIEvaluation {
  score: number     // 0-10
  feedback: string
}

export interface AISummaryPayload {
  roleLabel: string
  roleScore: number
  skillResults: { label: string; score: number; level: string }[]
  openAnswers: {
    question: string
    answer: string
    score: number
    feedback: string
  }[]
}

/**
 * Надіслати одну відкриту відповідь на AI-оцінку.
 * Повертає { score: 0-10, feedback: string }
 */
export async function evaluateAnswer(
  roleLabel: string,
  question: string,
  answer: string
): Promise<AIEvaluation> {
  const res = await fetch(`${BASE}/api/ai/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleLabel, question, answer }),
  })
  if (!res.ok) throw new Error('AI evaluation failed')
  return res.json() as Promise<AIEvaluation>
}

/**
 * Отримати загальний AI-опис кандидата після квізу.
 * Повертає { summary: string }
 */
export async function generateSummary(
  payload: AISummaryPayload
): Promise<{ summary: string }> {
  const res = await fetch(`${BASE}/api/ai/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('AI summary failed')
  return res.json() as Promise<{ summary: string }>
}
