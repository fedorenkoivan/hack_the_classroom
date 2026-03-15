import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

// GET /api/repos?skillSlug=js&level=junior
// Повертає репозиторії для конкретного скіла і рівня
router.get('/', async (req: Request, res: Response) => {
  const { skillSlug, level } = req.query as { skillSlug?: string; level?: string }

  if (!skillSlug || !level) {
    res.status(400).json({ error: 'skillSlug and level query params are required' })
    return
  }

  const normalizedLevel = level.toLowerCase()

  try {
    const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } })
    if (!skill) {
      res.status(404).json({ error: `Skill "${skillSlug}" not found` })
      return
    }

    const repos = await prisma.repo.findMany({
      where: { skillId: skill.id, level: normalizedLevel },
      orderBy: { name: 'asc' },
    })

    res.json(repos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch repos' })
  }
})

export default router
