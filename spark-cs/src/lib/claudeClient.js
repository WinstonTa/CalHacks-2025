import { buildRoadmapPrompt } from './roadmapPrompt.js'

const API_BASE = import.meta.env?.VITE_API_BASE || ''

export async function generateRoadmap({ branch, domain, signal }) {
  const system = 'You are Claude, a precise and practical technical mentor.'
  const prompt = buildRoadmapPrompt({ branch, domain })
  
  const res = await fetch(`${API_BASE}/api/claude/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      system,
      max_tokens: 2048,
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
