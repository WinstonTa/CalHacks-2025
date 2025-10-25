import { NavLink, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStoredTheme, setStoredTheme, applyTheme, nextTheme, resolveTheme } from '../theme.js'

export default function NavBar() {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    const t = getStoredTheme()
    setTheme(t)
  }, [])

  function cycleTheme() {
    const next = nextTheme(theme)
    setTheme(next)
    setStoredTheme(next)
    applyTheme(next)
  }

  const resolved = resolveTheme(theme)
  const icon = theme === 'system' ? '🖥️' : resolved === 'dark' ? '🌙' : '☀️'
  const label = `Theme: ${theme}`

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand nav-link" aria-label="Spark CS Home">
          SparkCS
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Profile
          </NavLink>
          <NavLink to="/guidance" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Guidance
          </NavLink>
          <NavLink to="/roadmap" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Roadmap
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Library
          </NavLink>
        </nav>
        <button className="btn theme-toggle" onClick={cycleTheme} aria-label={label} title={label}>
          <span aria-hidden>{icon}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.8 }}>{theme}</span>
        </button>
      </div>
    </header>
  )
}
