import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { generateRoadmapStream } from '../lib/claudeClient.js'


import { auth } from '../lib/firebase.js'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
 

export default function Profile() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  //const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)

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
  const [justFinished, setJustFinished] = useState(false)

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
      setJustFinished(false)
      return
    }
    const controller = new AbortController()
    let finished = false
    const run = async () => {
      try {
        setAiLoading(true)
        setAiError('')
        setAiOutput('')
        setJustFinished(false)
        await generateRoadmapStream({
          branch,
          domain,
          signal: controller.signal,
          onToken: (chunk) => {
            setAiOutput((prev) => prev + chunk)
          },
        })
        finished = true
        setJustFinished(true)
        setTimeout(() => setJustFinished(false), 2200)
      } catch (e) {
        if (e.name !== 'AbortError') setAiError(e.message || 'Request failed')
      } finally {
        setAiLoading(false)
      }
    }
    setAiKey((k) => k + 1)
    run()
    return () => {
      controller.abort()
    }
  }, [branch, domain])




  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setError('')
      setMessage('')
      if (u) {
        const saved = localStorage.getItem(`sparkcs_profile_${u.uid}`)
        if (saved) {
          const p = JSON.parse(saved)
          setName(p.name || '')
          setBio(p.bio || '')
        } else {
          setName('')
          setBio('')
        }
        setEmail(u.email || '')
      } else {
        setEmail('')
        setPassword('')
        setName('')
        setBio('')
      }
    })
    return () => unsub()
  }, [])

  

  async function handleAuth(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        const uid = cred.user.uid
        localStorage.setItem(`sparkcs_profile_${uid}`, JSON.stringify({ name, bio }))
        setMessage('Account created and profile saved')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        setMessage('Logged in')
      }
      setPassword('')
    } catch (err) {
      setError(err.message || 'Authentication error')
    }
  }
  

  function handleSaveProfile(e) {
    e.preventDefault()
    if (!user) return
    localStorage.setItem(`sparkcs_profile_${user.uid}`, JSON.stringify({ name, bio }))
    setMessage('Profile saved')
  }

  async function handleSignOut() {
    setError('')
    setMessage('')
    await signOut(auth)
  }

  return (
    <div>
      <h1>Profile</h1>
      {!user ? (
        <form onSubmit={handleAuth} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          <label>
            <div>Email</div>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <div>Password</div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {mode === 'signup' && (
            <>
              <label>
                <div>Name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                <div>Bio</div>
                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </label>
            </>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{mode === 'signup' ? 'Sign Up' : 'Log In'}</button>
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              {mode === 'signup' ? 'Have an account? Log In' : 'No account? Sign Up'}
            </button>
          </div>
          {message && <div role="status">{message}</div>}
          {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}
        </form>
      ) : (
        <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          <div>Signed in as {user.email}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 12 }}>
            <label>
              <div>Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              <div>Bio</div>
              <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </label>
            <button type="submit">Save Profile</button>
            {message && <div role="status">{message}</div>}
            {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}
          </form>
        </div>

        



      )}

      
    </div>
  )
}