import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

/**
 * POST /api/results
 * Body: {
 *   sessionId: string          – унікальний ID сесії браузера
 *   results: Array<{
 *     skillSlug: string,       – "js" | "ts"
 *     score: number,           – 0-100
 *     level: string            – "Junior" | "Middle" | "Strong Middle"
 *   }>
 * }
 *
 * Зберігає/оновлює результати квізу для кожного скіла.
 * Повертає збережені UserSkill-записи разом з репозиторіями для roadmap.
 */
router.post('/', async (req: Request, res: Response) => {
  const { sessionId, results } = req.body as {
    sessionId: string
    results: { skillSlug: string; score: number; level: string }[]
  }

  if (!sessionId || !Array.isArray(results) || results.length === 0) {
    res.status(400).json({ error: 'sessionId and results[] are required' })
    return
  }

  try {
    // Знайти або створити юзера за sessionId
    const user = await prisma.user.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    })

    const savedSkills: {
      skillSlug: string
      label: string
      score: number
      level: string
      repos: { name: string; url: string }[]
    }[] = []

    for (const result of results) {
      const skill = await prisma.skill.findUnique({
        where: { slug: result.skillSlug },
      })

      if (!skill) {
        console.warn(`Skill "${result.skillSlug}" not found in DB, skipping`)
        continue
      }

      // Upsert UserSkill
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: user.id, skillId: skill.id } },
        update: { score: result.score, level: result.level },
        create: {
          userId: user.id,
          skillId: skill.id,
          score: result.score,
          level: result.level,
        },
      })

      // Визначаємо рівень для репок: Junior → "junior", решта → "middle"
      const repoLevel = result.level === 'Junior' ? 'junior' : 'middle'

      const repos = await prisma.repo.findMany({
        where: { skillId: skill.id, level: repoLevel },
        orderBy: { name: 'asc' },
      })

      savedSkills.push({
        skillSlug: skill.slug,
        label: skill.label,
        score: result.score,
        level: result.level,
        repos: repos.map((r) => ({ name: r.name, url: r.url })),
      })
    }

    res.status(201).json({ userId: user.id, skills: savedSkills })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save results' })
  }
})

/**
 * GET /api/results/:sessionId
 * Повертає збережені результати і roadmap для конкретної сесії.
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  const sessionId = req.params['sessionId'] as string

  try {
    const user = await prisma.user.findUnique({
      where: { sessionId },
    })

    if (!user) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: {
          include: { repos: true },
        },
      },
    })

    const skills = userSkills.map((us) => {
      const repoLevel = us.level === 'Junior' ? 'junior' : 'middle'
      const repos = us.skill.repos
        .filter((r) => r.level === repoLevel)
        .map((r) => ({ name: r.name, url: r.url }))

      return {
        skillSlug: us.skill.slug,
        label: us.skill.label,
        score: us.score,
        level: us.level,
        repos,
      }
    })

    res.json({ userId: user.id, skills })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

export default router
