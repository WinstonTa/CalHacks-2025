import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, signOut } = useAuth()
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">Spark CS</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="button" onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <NavLink to="/login">Sign In</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
