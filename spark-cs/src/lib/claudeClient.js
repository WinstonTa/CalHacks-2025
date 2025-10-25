import { buildRoadmapPrompt } from './roadmapPrompt.js'

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8787'
//const ANTHROPIC_API_KEY = import.meta.env?.ANTHROPIC_API_KEY || 'http://localhost:8787'

export async function generateRoadmap({ branch, domain, signal }) {
  const system = 'You are Claude, a precise and practical technical mentor.'
  const prompt = buildRoadmapPrompt({ branch, domain })
  
  const res = await fetch(`/api/claude/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
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
    throw new Error(text || 'Request failed, stop right here')
  }
  const data = await res.json()
  return data?.content || ''
}
