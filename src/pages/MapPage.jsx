import { useState, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import WorldMap          from '../components/WorldMap'
import GuestWall         from '../components/GuestWall'
import MicroCelebration  from '../components/MicroCelebration'
import AddTripModal      from '../components/AddTripModal'
import LoginModal        from './LoginModal'
import { useTrips } from '../hooks/useTrips'
import { geoToPercent } from '../utils/geo'
import { getGuestTrips } from '../hooks/useGuestTrips'

// Tenuto come fallback tecnico — non usato per lo stato TRY
const DEMO_TRIPS = [
  { id: 'demo-1', place_name: 'Roma',     emoji: '🏛️', lat: 41.9028, lng: 12.4964,  photo_url: null, visit_date: '2023-04-10' },
  { id: 'demo-2', place_name: 'Tokyo',    emoji: '🌸', lat: 35.6762, lng: 139.6503, photo_url: null, visit_date: '2022-11-03' },
  { id: 'demo-3', place_name: 'New York', emoji: '🌆', lat: 40.7128, lng: -74.0060, photo_url: null, visit_date: '2024-06-15' },
  { id: 'demo-4', place_name: 'Parigi',   emoji: '🗼', lat: 48.8566, lng: 2.3522,   photo_url: null, visit_date: '2021-09-22' },
].map(t => { const { left, top } = geoToPercent(t.lat, t.lng); return { ...t, map_x: left, map_y: top } })

export default function MapPage({ user, signInWithEmail, onSignOut }) {
  const { trips, loading, addTrip, deleteTrip } = useTrips()
  const [showModal,       setShowModal]       = useState(false)
  const [showLogin,       setShowLogin]       = useState(false)
  const [lastAddedTripId, setLastAddedTripId] = useState(null)
  const location = useLocation()

  // Guest trips da localStorage — normalizzati con map_x/map_y/photo_url per Polaroid
  const rawGuest   = (!user) ? getGuestTrips() : []
  const guestTrips = rawGuest.map(t => {
    const { left, top } = geoToPercent(t.lat ?? 0, t.lng ?? 0)
    return { ...t, map_x: left, map_y: top, photo_url: t.photo_src ?? null }
  })

  // Trip celebrato — catturato una sola volta al mount con useState lazy.
  // Nessun side-effect qui: window.history.replaceState è in useEffect.
  const [celebrateTrip] = useState(() => {
    if (!user && location.state?.celebrate) {
      return guestTrips.find(t => t.id === location.state.tripId) ?? guestTrips[0] ?? null
    }
    return null
  })

  // Pulisce lo state dalla history DOPO il mount → no overlay su refresh
  useEffect(() => {
    if (celebrateTrip) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // ── Non autenticato — routing per stato TRY ─────────────────────────────────
  // Nessun ricordo: /try è la vera landing → redirect diretto (no double-landing)
  if (!user && guestTrips.length === 0) {
    return <Navigate to="/try" replace />
  }

  // Ha almeno 1 ricordo → mostra GuestWall con polaroid + eventuale MicroCelebration
  if (!user) {
    return (
      <>
        <GuestWall
          guestTrips={guestTrips}
          onSaveClick={() => console.log('save memories clicked')}
        />
        {celebrateTrip && (
          <MicroCelebration
            trip={celebrateTrip}
            onDismiss={() => {}}
          />
        )}
      </>
    )
  }

  // ── Autenticato → WorldMap legacy ────────────────────────────────────────────

  async function handleAddTrip(tripData) {
    try {
      const newTrip = await addTrip({ ...tripData, user_id: user.id })
      const id = newTrip?.id ?? `anim-${Date.now()}`
      setLastAddedTripId(null)
      requestAnimationFrame(() => setLastAddedTripId(id))
    } catch (err) {
      console.error('Errore aggiunta viaggio:', err)
    } finally {
      setShowModal(false)
    }
  }

  async function handleDeleteTrip(id) {
    try { await deleteTrip(id) }
    catch (err) { console.error('Errore eliminazione viaggio:', err) }
  }

  return (
    <div className="w-full overflow-hidden" style={{ height: '100vh' }}>
      <WorldMap
        trips={trips}
        onDeleteTrip={handleDeleteTrip}
        lastAddedTripId={lastAddedTripId}
        disabled={showModal || showLogin}
      />

      {/* Logout */}
      {!showModal && !showLogin && (
        <button
          onClick={onSignOut}
          title="Esci"
          style={{
            position: 'fixed', top: 12, right: 12, zIndex: 40,
            padding: '5px 12px',
            background: 'rgba(42,18,5,0.65)',
            border: '1px solid rgba(196,170,132,0.4)',
            borderRadius: 3, color: 'rgba(245,230,200,0.8)',
            fontSize: 11, fontFamily: 'sans-serif',
            cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          esci
        </button>
      )}

      {/* Aggiungi viaggio */}
      {!showModal && !showLogin && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            zIndex: 40, padding: '13px 28px', borderRadius: 40,
            background: '#E8A050', border: '3px solid rgba(255,255,255,0.85)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.03em', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          📸 Carica una foto
        </button>
      )}

      {loading && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16,
          fontSize: 11, padding: '4px 10px', borderRadius: 4,
          background: 'rgba(59,31,10,0.8)', color: '#F5EDE0', zIndex: 50,
        }}>
          Caricamento…
        </div>
      )}

      {showLogin && (
        <LoginModal
          signInWithEmail={signInWithEmail}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showModal && (
        <AddTripModal
          coords={{ x: 50, y: 50 }}
          userId={user.id}
          onConfirm={handleAddTrip}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
