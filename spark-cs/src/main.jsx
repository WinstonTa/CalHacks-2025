import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Guidance from './pages/Guidance.jsx'
import Roadmap from './pages/Roadmap.jsx'
import Library from './pages/Library.jsx'
import { initTheme } from './theme.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'profile', element: <Profile /> },
      { path: 'guidance', element: <Guidance /> },
      { path: 'roadmap', element: <Roadmap /> },
      { path: 'library', element: <Library /> },
    ],
  },
])

// Initialize theme ASAP
initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
