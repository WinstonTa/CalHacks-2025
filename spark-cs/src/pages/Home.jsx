import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="container">
      <h1>Spark CS</h1>
      <p>Welcome to Spark CS. Explore computer science resources and get started today.</p>
      <div className="actions">
        {user ? (
          <Link className="button" to="/profile">Go to Profile</Link>
        ) : (
          <Link className="button" to="/login">Get Started</Link>
        )}
      </div>
    </div>
  )
}
