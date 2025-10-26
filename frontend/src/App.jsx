import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import './App.css'

function App() {
  return (
    <>
      <NavBar />
      <main>
        <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
          <Outlet />
        </div>
      </main>
    </>
  )
}

export default App
