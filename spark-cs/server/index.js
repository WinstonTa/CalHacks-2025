import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import claudeRouter from './src/routes/claude.js'

const app = express()

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN, credentials: false }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/claude', claudeRouter)

// Error handler (last)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error, here2' })
})

app.listen(PORT, () => {
  console.log(`Claude backend listening on http://localhost:${PORT}`)
  console.log(`CORS origin: ${ORIGIN}`)
})
