import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav style={{ display: 'flex', gap: 16, padding: 16, justifyContent: 'center' }}>
      <Link to="/">Home</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/guidance">Guidance</Link>
      <Link to="/roadmap">Roadmap</Link>
      <Link to="/library">Library</Link>
    </nav>
  )
}
