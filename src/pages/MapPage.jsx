import { useState } from 'react'
import WorldMap from '../components/WorldMap'
import AddTripModal from '../components/AddTripModal'
import HamburgerMenu from '../components/HamburgerMenu'
import { useTrips } from '../hooks/useTrips'

export default function MapPage() {
  const { trips, loading, addTrip, deleteTrip } = useTrips()
  const [pendingCoords, setPendingCoords] = useState(null)
  const [lastAddedTripId, setLastAddedTripId] = useState(null)

  function handleMapClick({ x, y }) {
    setPendingCoords({ x, y })
  }

  async function handleAddTrip(tripData) {
    try {
      const newTrip = await addTrip(tripData)
      const id = newTrip?.id ?? `anim-${Date.now()}`
      setLastAddedTripId(null)
      requestAnimationFrame(() => setLastAddedTripId(id))
    } catch (err) {
      console.error('Errore aggiunta viaggio:', err)
    } finally {
      setPendingCoords(null)
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
    <div className="w-full overflow-hidden" style={{ height: '100vh', background: '#1e0e02' }}>
      <WorldMap
        trips={trips}
        onMapClick={handleMapClick}
        onDeleteTrip={handleDeleteTrip}
        lastAddedTripId={lastAddedTripId}
        disabled={!!pendingCoords}
      />

      <HamburgerMenu />

      {loading && (
        <div
          className="fixed bottom-4 left-4 text-xs px-3 py-2 rounded z-50"
          style={{ background: 'rgba(59,31,10,0.85)', color: '#F5EDE0' }}
        >
          Caricamento...
        </div>
      )}

      {pendingCoords && (
        <AddTripModal
          coords={pendingCoords}
          onConfirm={handleAddTrip}
          onCancel={() => setPendingCoords(null)}
        />
      )}
    </div>
  )
}
