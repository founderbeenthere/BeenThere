import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MapPage     from './pages/MapPage'
import LandingPage from './pages/LandingPage'
import TryPage     from './pages/TryPage'
import LiquidFactory from './pages/LiquidFactory'

export default function App() {
  const { user, signInWithEmail, signOut } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<MapPage user={user} signInWithEmail={signInWithEmail} onSignOut={signOut} />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/try"     element={<TryPage />} />
        <Route path="/liquid-factory" element={<LiquidFactory />} />
        {/* Qualsiasi rotta sconosciuta → flusso Try, mai una pagina vuota */}
        <Route path="*"        element={<Navigate to="/try" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
