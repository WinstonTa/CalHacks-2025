import { Router } from 'express'
import { z } from 'zod'
import { Anthropic } from 'anthropic'

const router = Router()

const bodySchema = z.object({
  model: z.string().optional().default('claude-3-5-sonnet-latest'),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']).default('user'),
        content: z.string().min(1),
      }),
    )
    .min(1),
  max_tokens: z.number().int().positive().max(4096).optional().default(1024),
  system: z.string().optional(),
})

function ensureKey() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    const err = new Error('Missing ANTHROPIC_API_KEY')
    err.status = 500
    throw err
  }
  return key
}

router.post('/chat', async (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    // Minimal request debug (do not log content to avoid large outputs)
    console.log('[claude/chat] body keys:', Object.keys(req.body || {}))
  }
  try {
    const parsed = bodySchema.parse(req.body)
    const client = new Anthropic({ apiKey: ensureKey() })

    // Map our simple {role, content} array to Anthropic messages format
    const messages = parsed.messages
      .filter((m) => m.role !== 'system') // system is passed separately
      .map((m) => ({ role: m.role, content: m.content }))

    const response = await client.messages.create({
      model: parsed.model,
      max_tokens: parsed.max_tokens,
      system: parsed.system,
      messages,
    })

    res.json({
      id: response.id,
      model: response.model,
      content: response.content?.map((c) => (c.type === 'text' ? c.text : ''))?.join('') ?? '',
      usage: response.usage,
    })
  } catch (err) {
    // Normalize Anthropic/SDK errors
    const status = err.status || err.statusCode || 500
    const msg = err?.message || 'Internal Server Error, here1'
    const details = err?.error?.message || err?.response?.data || undefined
    console.error('[claude/chat] error:', msg, details || '')
    res.status(status).json({ error: msg, details })
  }
})

export default router
