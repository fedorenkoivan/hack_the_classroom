import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

/**
 * GET /api/quiz
 * Повертає всі скіли з питаннями та варіантами відповідей.
 *
 * GET /api/quiz?skillSlug=js
 * Повертає питання тільки для одного скіла.
 */
router.get('/', async (req: Request, res: Response) => {
  const { skillSlug } = req.query as { skillSlug?: string }

  try {
    const skills = await prisma.skill.findMany({
      where: skillSlug ? { slug: skillSlug } : undefined,
      orderBy: { slug: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { score: 'asc' },
            },
          },
        },
      },
    })

    // Відфільтровуємо скіли без питань
    const withQuestions = skills.filter((s) => s.questions.length > 0)

    res.json(withQuestions)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch quiz' })
  }
})

export default router
