import { buildRoadmapPrompt } from './roadmapPrompt.js'

const API_BASE = import.meta.env?.VITE_API_BASE || (import.meta.env?.DEV ? 'http://localhost:8787' : '')


export async function generateRoadmap({ branch, domain, signal }) {
  const system = 'You are Claude, a precise and practical technical mentor.'
  const prompt = buildRoadmapPrompt({ branch, domain })
  
  const res = await fetch(`${API_BASE}/api/claude/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      system,
      max_tokens: 25000,
      messages: [
        { role: 'user', content: prompt }
      ]
    }),
    signal,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  const data = await res.json()
  return data?.content || ''
}

export async function generateRoadmapStream({ branch, domain, onToken, signal, model = 'claude-sonnet-4-5-20250929', max_tokens = 25000, system = 'You are Claude, a precise and practical technical mentor.' }) {
  const prompt = buildRoadmapPrompt({ branch, domain })
  const res = await fetch(`${API_BASE}/api/claude/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system,
      max_tokens,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
    signal,
  })
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(text || 'Stream request failed')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      const line = raw.trim()
      if (!line) continue
      // Expect lines like: "data: <json string>" or "event: done"
      if (line.startsWith('event:')) {
        continue
      }
      if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim()
        if (dataStr === '"[DONE]"' || dataStr === '[DONE]') {
          return
        }
        try {
          const chunk = JSON.parse(dataStr)
          if (typeof chunk === 'string') onToken?.(chunk)
        } catch {
          // Fallback: treat as plain text
          onToken?.(dataStr)
        }
      }
    }
  }
}
