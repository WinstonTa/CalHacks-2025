import { useState, useEffect, useMemo } from 'react'
import { generateRoadmap } from '../lib/claudeClient.js'

export default function Profile() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

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

  function norm(s) {
    return (s || '').toLowerCase().trim()
  }

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

  const [branch, setBranch] = useState('')
  const [domain, setDomain] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiOutput, setAiOutput] = useState('')
  const [aiKey, setAiKey] = useState(0)

  // Load saved profile (local demo-only)
  useEffect(() => {
    const saved = localStorage.getItem('sparkcs_profile')
    if (saved) {
      const p = JSON.parse(saved)
      setEmail(p.email || '')
      setName(p.name || '')
      setBio(p.bio || '')
    }
  }, [])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sparkcs_questionnaire') || '{}')
    if (saved && saved.branch) setBranch(saved.branch)
    if (saved && saved.domain) setDomain(saved.domain)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const profile = { email, name, bio }
    localStorage.setItem('sparkcs_profile', JSON.stringify(profile))
    localStorage.setItem('sparkcs_auth', JSON.stringify({ email, password }))
    setMessage('Saved! (Mock auth stored locally)')
    setPassword('')
  }

  useEffect(() => {
    localStorage.setItem('sparkcs_questionnaire', JSON.stringify({ branch, domain }))
  }, [branch, domain])

  useEffect(() => {
    if (!branch || !domain) {
      setAiOutput('')
      setAiError('')
      setAiLoading(false)
      return
    }
    const controller = new AbortController()
    const run = async () => {
      try {
        setAiLoading(true)
        setAiError('')
        const content = await generateRoadmap({ branch, domain, signal: controller.signal })
        setAiOutput(content)
      } catch (e) {
        if (e.name !== 'AbortError') setAiError(e.message || 'Request failed')
      } finally {
        setAiLoading(false)
      }
    }
    setAiKey((k) => k + 1)
    run()
    return () => controller.abort()
  }, [branch, domain])

  return (
    <div>
      <h1>Profile</h1>
      <p>Tell us about yourself. Email/password used for local demo-only auth.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
        <label>
          <div>Email</div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <div>Password</div>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          <div>Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          <div>Bio</div>
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <button type="submit">Save</button>
        {message && <div role="status">{message}</div>}
      </form>

      <section className="card stack-3" style={{ marginTop: 24, maxWidth: 640 }}>
        <div>
          <label htmlFor="branch-select">Branches of computer science you are interested in</label>
          <select
            id="branch-select"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value)
              setDomain('')
            }}
          >
            <option value="">Select a branch...</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="domain-select">Domains of computer science you are interested in</label>
          <select
            id="domain-select"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={!branch}
          >
            <option value="">{!branch ? 'Select a branch first...' : 'Select a domain...'}</option>
            {(domainMap[norm(branch)] || []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </section>

      {(branch && domain) && (
        <section className="card" style={{ marginTop: 16, maxWidth: 860 }}>
          <h2 style={{ marginTop: 0 }}>AI Roadmap for {domain}</h2>
          {aiLoading && <div role="status">Generating roadmap…</div>}
          {aiError && <div role="alert" style={{ color: 'crimson' }}>{aiError}</div>}
          {!aiLoading && !aiError && aiOutput && (
            <div style={{ whiteSpace: 'pre-wrap' }}>{aiOutput}</div>
          )}
        </section>
      )}
    </div>
  )
}