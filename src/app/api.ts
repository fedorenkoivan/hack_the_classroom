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
  text: string
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
