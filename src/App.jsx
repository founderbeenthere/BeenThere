import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
