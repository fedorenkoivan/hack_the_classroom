import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import skillsRouter from './routes/skills'
import reposRouter from './routes/repos'
import resultsRouter from './routes/results'

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
)
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/skills', skillsRouter)
app.use('/api/repos', reposRouter)
app.use('/api/results', resultsRouter)

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  API running at http://localhost:${PORT}`)
})

export default app
