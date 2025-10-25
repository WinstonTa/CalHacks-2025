import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('signin')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    }
  }

  return (
    <div className="container">
      <h1>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="button" type="submit">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</button>
      </form>
      <div className="muted">
        {mode === 'signin' ? (
          <button className="link" onClick={() => setMode('signup')}>Need an account? Sign up</button>
        ) : (
          <button className="link" onClick={() => setMode('signin')}>Already have an account? Sign in</button>
        )}
      </div>
    </div>
  )
}
