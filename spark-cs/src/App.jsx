import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import './App.css'

function App() {
  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <Outlet />
      </div>
    </>
  )
}

export default App
