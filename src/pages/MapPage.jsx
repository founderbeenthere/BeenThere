import { useState } from 'react'
import WorldMap from '../components/WorldMap'
import AddTripModal from '../components/AddTripModal'
import { useTrips } from '../hooks/useTrips'

export default function MapPage() {
  const { trips, loading, addTrip, deleteTrip } = useTrips()
  const [showModal, setShowModal] = useState(false)
  const [lastAddedTripId, setLastAddedTripId] = useState(null)

  async function handleAddTrip(tripData) {
    try {
      const newTrip = await addTrip(tripData)
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
    try {
      await deleteTrip(id)
    } catch (err) {
      console.error('Errore eliminazione viaggio:', err)
    }
  }

  return (
    <div className="w-full overflow-hidden" style={{ height: '100vh' }}>
      <WorldMap
        trips={trips}
        onDeleteTrip={handleDeleteTrip}
        lastAddedTripId={lastAddedTripId}
        disabled={showModal}
      />

      {/* Floating + button — sole action */}
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#E8A050',
            border: '3px solid rgba(255,255,255,0.85)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            color: '#fff',
            fontSize: 28,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Aggiungi luogo"
        >
          +
        </button>
      )}

      {loading && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 4,
            background: 'rgba(59,31,10,0.8)',
            color: '#F5EDE0',
            zIndex: 50,
          }}
        >
          Caricamento...
        </div>
      )}

      {showModal && (
        <AddTripModal
          coords={{ x: 50, y: 50 }}
          onConfirm={handleAddTrip}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
