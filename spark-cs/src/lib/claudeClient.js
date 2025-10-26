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
      ],
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

export async function generateMindmapData({ branch, domains, signal, model = 'claude-sonnet-4-5-20250929' }) {
  const system = 'You are Claude, a precise and practical technical mentor. Respond with strict JSON only.'
  const prompt = `We are building a mindmap for the branch: ${branch}.
Given these domains under that branch: ${domains.join(', ')}.
For EACH domain, produce 3-6 concise subdomains (1-3 words each). For EACH subdomain, also produce 3-6 concise child topics (1-3 words each).
Return STRICT JSON only in this shape:
{
  "items": [
    { "domain": "<domain>", "subdomains": [
        { "name": "<subdomain>", "children": ["<child>", "<child>"] },
        { "name": "<subdomain>", "children": ["<child>", "<child>"] }
    ] }
  ]
}
No prose or extra text.`

  const res = await fetch(`${API_BASE}/api/claude/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  const data = await res.json()
  const content = data?.content || '{}'
  try {
    const parsed = JSON.parse(content)
    // Normalize variations: allow subdomains to be either strings or {name, children}
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return items.map((it) => ({
      domain: it?.domain,
      subdomains: (Array.isArray(it?.subdomains) ? it.subdomains : []).map((s) => {
        if (typeof s === 'string') return { name: s, children: [] }
        return { name: s?.name ?? '', children: Array.isArray(s?.children) ? s.children : [] }
      }),
    }))
  } catch {
    return []
  }
}

export async function summarizeTopic({ branch, domain, subdomain, signal, model = 'claude-sonnet-4-5-20250929' }) {
  const system = 'You are Claude, a precise and practical technical mentor.'
  const prompt = `Give a helpful 2-4 sentence summary of the skill "${subdomain}" within the domain "${domain}" under the branch "${branch}". Avoid lists; plain prose.`

  const res = await fetch(`${API_BASE}/api/claude/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
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
