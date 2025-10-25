import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, signOut } = useAuth()
  return (
    <div className="container">
      <h1>Profile</h1>
      <p><strong>Email:</strong> {user?.email}</p>
      <button className="button" onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
