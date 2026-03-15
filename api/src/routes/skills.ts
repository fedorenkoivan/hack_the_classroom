import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

// GET /api/skills  – повертає всі скіли з БД
router.get('/', async (_req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { slug: 'asc' },
    })
    res.json(skills)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch skills' })
  }
})

export default router
