import { useState, useEffect } from 'react'

export default function Profile() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('sparkcs_profile')
    if (saved) {
      const p = JSON.parse(saved)
      setEmail(p.email || '')
      setName(p.name || '')
      setBio(p.bio || '')
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const profile = { email, name, bio }
    localStorage.setItem('sparkcs_profile', JSON.stringify(profile))
    localStorage.setItem('sparkcs_auth', JSON.stringify({ email, password }))
    setMessage('Saved! (Mock auth stored locally)')
    setPassword('')
  }

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
    </div>
  )
}
