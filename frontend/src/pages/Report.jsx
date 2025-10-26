import { useEffect, useMemo, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { generateRoadmapStream } from '../lib/claudeClient.js'

function norm(s) {
  return (s || '').toLowerCase().trim()
}

export default function Report() {
  const [branch, setBranch] = useState('')
  const [domain, setDomain] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiOutput, setAiOutput] = useState('')
  const [justFinished, setJustFinished] = useState(false)
  const outputRef = useRef(null)

  const branches = [
    'software development',
    'systems programming & infrastructure',
    'artificial intelligence & machine learning (ML)',
    'networking & security',
    'theory of computation',
    'human-computer interaction (HCI)',
    'computational biology',
    'computational linguistics',
    'theoretical & applied mathematics in computer science',
    'artificial intelligence & specialized technologies',
    'quantum computing',
    'computational creativity',
    'educational technology',
    'ethical & legal aspects of computing',
  ]

  const domainMap = useMemo(
    () => ({
      [norm('software development')]: [
        'web development',
        'game development',
        'desktop application development',
        'embedded systems',
        'software engineering',
      ],
      [norm('systems programming & infrastructure')]: [
        'operating systems',
        'computer architecture',
        'database management',
        'cloud computing',
        'DevOPs',
      ],
      [norm('artificial intelligence & machine learning (ML)')]: [
        'Artificial Intelligence (AI)',
        'Machine Learning (ML)',
        'Data Science',
        'Reinforcement Learning',
        'AI Ethics',
      ],
      [norm('networking & security')]: [
        'Network Engineering',
        'Cybersecurity',
        'Ethical Hacking',
        'Blockchain Technology',
      ],
      [norm('theory of computation')]: [
        'Automata Theory',
        'Computational Complexity Theory',
        'Formal Languages',
        'Parallel and Distributed Computing',
      ],
      [norm('human-computer interaction (HCI)')]: [
        'User Interface (UI) Design',
        'User Experience (UX)',
        'Augmented Reality (AR) & Virtual Reality (VR)',
      ],
      [norm('computational biology')]: [
        'Bioinformatics',
        'Computational Neuroscience',
        'Systems Biology',
      ],
      [norm('computational linguistics')]: [
        'Natural Language Processing (NLP)',
        'Speech Processing',
      ],
      [norm('theoretical & applied mathematics in computer science')]: [
        'Mathematical Foundations of Computing',
        'Algorithms & Data Structures',
        'Computational Geometry',
      ],
      [norm('artificial intelligence & specialized technologies')]: [
        'Autonomous Systems',
        'Computer Vision',
        'Natural Language Generation (NLG)',
      ],
      [norm('quantum computing')]: [
        'Quantum Algorithms',
        'Quantum Hardware',
        'Quantum Software Development',
      ],
      [norm('computational creativity')]: [
        'Generative Art',
        'Game AI',
      ],
      [norm('educational technology')]: [
        'E-learning Platforms',
        'Adaptive Learning Systems',
      ],
      [norm('ethical & legal aspects of computing')]: [
        'Privacy',
        'Technology & Society',
      ],
    }),
    [],
  )

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sparkcs_questionnaire') || '{}')
    if (saved && saved.branch) setBranch(saved.branch)
    if (saved && saved.domain) setDomain(saved.domain)
  }, [])

  useEffect(() => {
    localStorage.setItem('sparkcs_questionnaire', JSON.stringify({ branch, domain }))
  }, [branch, domain])

  async function handleGenerate() {
    if (!branch || !domain) return
    const controller = new AbortController()
    try {
      setAiLoading(true)
      setAiError('')
      setAiOutput('')
      setJustFinished(false)
      await generateRoadmapStream({
        branch,
        domain,
        signal: controller.signal,
        onToken: (chunk) => setAiOutput((p) => p + chunk),
      })
      setJustFinished(true)
      setTimeout(() => setJustFinished(false), 2200)
    } catch (e) {
      if (e.name !== 'AbortError') setAiError(e.message || 'Request failed')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(aiOutput || '')
    } catch {}
  }

  function handlePdf() {
    const el = outputRef.current
    if (!el) return
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Report</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif; padding: 24px; }
      .markdown { line-height: 1.6; max-width: 760px; margin: 0 auto; }
      .markdown h1 { font-size: 1.8rem; }
      .markdown h2 { font-size: 1.5rem; }
      .markdown pre { background: #f4f4f4; padding: 12px; border-radius: 8px; }
      @media print { @page { margin: 12mm; } }
    </style>
    </head><body><div class="markdown">${el.innerHTML}</div>
    <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); }<\/script>
    </body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <div>
      <h1>Report</h1>

      <section className="card stack-3" style={{ marginTop: 32, maxWidth: 640, marginInline: 'auto' }}>
        <div>
          <label htmlFor="branch-select">Branches of computer science you are interested in</label>
          <select
            id="branch-select"
            value={branch}
            onChange={(e) => { setBranch(e.target.value); setDomain(''); setAiOutput(''); setAiError(''); setJustFinished(false) }}
          >
            <option value="">Select a branch...</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="domain-select">Domains of computer science you are interested in</label>
          <select
            id="domain-select"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setAiOutput(''); setAiError(''); setJustFinished(false) }}
            disabled={!branch}
          >
            <option value="">{!branch ? 'Select a branch first...' : 'Select a domain...'}</option>
            {(domainMap[norm(branch)] || []).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </section>

      <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
        <button className="btn" onClick={handleGenerate} disabled={!branch || !domain || aiLoading}>
          {aiLoading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, placeItems: 'center', marginTop: 24 }}>
        <button className="btn" onClick={handleCopy} disabled={!aiOutput}>Copy to clipboard</button>
        <button className="btn" onClick={handlePdf} disabled={!aiOutput}>Save as PDF</button>
      </div>

      {(branch && domain) && (
        <section
          className={`card response-card ${justFinished ? 'sweep' : ''}`}
          style={{ marginTop: 24, maxWidth: 860, marginInline: 'auto' }}
        >
          <h2 style={{ marginTop: 0 }}>AI Report for {domain}</h2>
          {aiLoading && <div role="status">Generating report…</div>}
          {aiError && <div role="alert" style={{ color: 'crimson' }}>{aiError}</div>}
          {!aiError && aiOutput && (
            <div id="report-output" className="markdown" ref={outputRef}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiOutput}</ReactMarkdown>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
