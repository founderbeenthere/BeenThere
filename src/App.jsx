import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MapPage     from './pages/MapPage'
import LandingPage from './pages/LandingPage'
import TryPage     from './pages/TryPage'

export default function App() {
  const { user, signInWithEmail, signOut } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<MapPage user={user} signInWithEmail={signInWithEmail} onSignOut={signOut} />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/try"     element={<TryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
