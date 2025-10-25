import { useState, useEffect } from 'react'

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
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)

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