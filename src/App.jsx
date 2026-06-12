import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MapPage      from './pages/MapPage'
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/LoginPage'

function AuthGate() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          background: '#2a1205',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9a7a58',
          fontFamily: 'sans-serif',
          fontSize: 14,
        }}
      >
        Caricamento…
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <MapPage user={user} onSignOut={signOut} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<AuthGate />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
