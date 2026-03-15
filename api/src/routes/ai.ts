import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'

const router = Router()

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' })

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvaluateBody {
  roleLabel: string       // "Frontend Engineer"
  question: string        // текст відкритого питання
  answer: string          // відповідь кандидата
}

interface SummaryBody {
  roleLabel: string
  roleScore: number                      // 0-100
  skillResults: {
    label: string
    score: number
    level: string
  }[]
  openAnswers: {
    question: string
    answer: string
    score: number        // 0-10 від AI
    feedback: string     // коментар від AI
  }[]
}

// ─── POST /api/ai/evaluate ────────────────────────────────────────────────────
/**
 * Оцінює одну відкриту відповідь кандидата.
 * Повертає { score: 0-10, feedback: string }
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  const { roleLabel, question, answer } = req.body as EvaluateBody

  if (!question || !answer) {
    res.status(400).json({ error: 'question and answer are required' })
    return
  }

  if (!answer.trim() || answer.trim().length < 5) {
    res.json({ score: 0, feedback: 'Відповідь занадто коротка для аналізу.' })
    return
  }

  try {
    const prompt = `Ти технічний інтерв'юер. Оцінюй відповідь кандидата на посаду "${roleLabel}".
Відповідай ТІЛЬКИ у форматі JSON: {"score": <число від 0 до 10>, "feedback": "<1-2 речення українською>"}
score: 0-3 слабко, 4-6 задовільно, 7-8 добре, 9-10 відмінно.
Будь конкретним і конструктивним.

Питання: ${question}

Відповідь кандидата: ${answer}`

    const result = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const raw = result.text ?? '{}'
    const match = raw.match(/\{[\s\S]*\}/)
    const parsed = match ? JSON.parse(match[0]) : { score: 5, feedback: 'Не вдалося обробити відповідь.' }

    res.json({
      score: Math.max(0, Math.min(10, Number(parsed.score) || 0)),
      feedback: String(parsed.feedback || ''),
    })
  } catch (err) {
    console.error('[AI evaluate]', err)
    res.status(500).json({ error: 'AI evaluation failed' })
  }
})

// ─── POST /api/ai/summary ─────────────────────────────────────────────────────
/**
 * Генерує загальний опис кандидата на основі всіх результатів квізу.
 * Повертає { summary: string }
 */
router.post('/summary', async (req: Request, res: Response) => {
  const { roleLabel, roleScore, skillResults, openAnswers } = req.body as SummaryBody

  try {
    const skillsText = skillResults
      .map((s) => `${s.label}: ${s.score}% (${s.level})`)
      .join(', ')

    const openText = openAnswers
      .map((a, i) => `Питання ${i + 1}: "${a.question}" → відповідь оцінена ${a.score}/10`)
      .join('\n')

    const prompt = `Ти досвідчений технічний рекрутер. Напиши короткий (3-4 речення) персоналізований опис кандидата українською мовою на основі результатів технічного квізу. Будь чесним, конструктивним і підбадьорливим. Не використовуй загальні фрази типу "кандидат показав..." — звертайся напряму: "Ви...".

Роль: ${roleLabel}
Загальний score: ${roleScore}%
Навички: ${skillsText}
Відкриті питання:
${openText}`

    const result = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const summary = result.text ?? 'Не вдалося отримати опис.'
    res.json({ summary })
  } catch (err) {
    console.error('[AI summary]', err)
    res.status(500).json({ error: 'AI summary failed' })
  }
})

export default router
