import { useState, useRef, useCallback, useEffect } from 'react'
import Polaroid from './Polaroid'

function SmallPin({ trip, onSelect, size }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        width:  size,
        height: size,
        borderRadius: '50%',
        background: '#C87828',
        border: '2px solid white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onClick={e => { e.stopPropagation(); onSelect(trip) }}
    />
  )
}

function TripPopup({ trip, onDelete, onClose }) {
  return (
    <div
      className="absolute z-50"
      style={{
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        transform: 'translate(-50%, calc(-100% - 16px))',
        minWidth: '180px',
        maxWidth: '220px',
        background: '#f8f4ef',
        border: '1px solid #d4c4b0',
        borderRadius: '4px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
        padding: '12px',
        fontFamily: "'Playfair Display', serif",
      }}
    >
      <div style={{
        position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
        borderTop: '7px solid #d4c4b0',
      }} />
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '6px solid #f8f4ef',
      }} />

      <button
        onClick={e => { e.stopPropagation(); onClose() }}
        style={{
          position: 'absolute', top: '6px', right: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9a7a58', fontSize: '14px', lineHeight: 1,
        }}
      >✕</button>

      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3d2009', paddingRight: '16px' }}>
        {trip.emoji && <span style={{ marginRight: '4px' }}>{trip.emoji}</span>}
        {trip.place_name}
      </div>

      {trip.visit_date && (
        <div style={{ fontSize: '11px', color: '#8a6a48', marginTop: '4px', fontFamily: 'sans-serif' }}>
          {new Date(trip.visit_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}

      {trip.note && (
        <div style={{
          fontSize: '13px', color: '#5c3d1e', marginTop: '6px',
          fontFamily: "'Caveat', cursive",
          borderTop: '1px solid #e4d4c0', paddingTop: '6px',
        }}>
          {trip.note}
        </div>
      )}

      <button
        onClick={e => { e.stopPropagation(); onDelete(trip.id); onClose() }}
        style={{
          marginTop: '10px', width: '100%', padding: '5px',
          background: '#c0392b', border: 'none', borderRadius: '3px',
          color: 'white', fontSize: '11px', cursor: 'pointer',
          fontFamily: 'sans-serif',
        }}
      >
        🗑 Elimina
      </button>
    </div>
  )
}

function useLandscapeMobile() {
  const check = () => typeof window !== 'undefined'
    && window.innerWidth > window.innerHeight
    && window.innerHeight < 600
  const [v, setV] = useState(check)
  useEffect(() => {
    const h = () => setV(check())
    window.addEventListener('resize', h)
    window.addEventListener('orientationchange', h)
    return () => {
      window.removeEventListener('resize', h)
      window.removeEventListener('orientationchange', h)
    }
  }, [])
  return v
}

export default function WorldMap({ trips, onMapClick, onDeleteTrip, lastAddedTripId, disabled }) {
  const containerRef = useRef(null)
  const innerRef     = useRef(null)
  const touchRef     = useRef(null)   // touch gesture state (avoids stale closures in passive listener)

  const [scale,        setScale]        = useState(1)
  const [offset,       setOffset]       = useState({ x: 0, y: 0 })
  const [dragging,     setDragging]     = useState(false)
  const [dragStart,    setDragStart]    = useState(null)
  const [hasDragged,   setHasDragged]   = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)

  const isLandscape  = useLandscapeMobile()
  const showPolaroids = scale > 1.5
  const pinSize       = isLandscape ? 16 : 12

  // Max 8 most recent trips for polaroids (trips already sorted DESC by created_at)
  const polaroidTrips = showPolaroids ? trips.slice(0, 8) : []

  // ── Mouse handlers ──────────────────────────────────────────────────────────
  const handleWheel = useCallback(e => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.15 : 0.87
    setScale(s => Math.max(0.8, Math.min(8, s * factor)))
  }, [])

  const handleMouseDown = useCallback(e => {
    setDragging(true)
    setHasDragged(false)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [offset])

  const handleMouseMove = useCallback(e => {
    if (!dragging || !dragStart) return
    setHasDragged(true)
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [dragging, dragStart])

  const handleMouseUp = useCallback(e => {
    setDragging(false)
    if (!hasDragged) {
      setSelectedTrip(null)
      if (onMapClick) {
        const inner = innerRef.current
        if (!inner) return
        const rect = inner.getBoundingClientRect()
        onMapClick({
          x: ((e.clientX - rect.left)  / rect.width)  * 100,
          y: ((e.clientY - rect.top)   / rect.height) * 100,
        })
      }
    }
  }, [hasDragged, onMapClick])

  // ── Touch handlers ───────────────────────────────────────────────────────────
  // touchmove must be non-passive to call preventDefault; attach via useEffect.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchMove(e) {
      const ts = touchRef.current
      if (!ts) return

      if (e.touches.length === 1 && ts.type === 'pan') {
        e.preventDefault()
        ts.hasDragged = true
        const t = e.touches[0]
        const next = { x: t.clientX - ts.startX, y: t.clientY - ts.startY }
        ts.offset = next
        setOffset(next)
      } else if (e.touches.length === 2 && ts.type === 'pinch') {
        e.preventDefault()
        const d = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        )
        setScale(Math.max(0.8, Math.min(8, ts.baseScale * (d / ts.baseDist))))
      }
    }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  const handleTouchStart = useCallback(e => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      touchRef.current = {
        type:      'pan',
        startX:    t.clientX - offset.x,
        startY:    t.clientY - offset.y,
        offset,
        hasDragged: false,
        clientX:   t.clientX,
        clientY:   t.clientY,
      }
    } else if (e.touches.length === 2) {
      touchRef.current = {
        type:      'pinch',
        baseDist:  Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        ),
        baseScale: scale,
      }
    }
  }, [offset, scale])

  const handleTouchEnd = useCallback(e => {
    const ts = touchRef.current
    if (ts?.type === 'pan' && !ts.hasDragged) {
      setSelectedTrip(null)
      if (onMapClick) {
        const t = e.changedTouches[0]
        const inner = innerRef.current
        if (!inner) return
        const rect = inner.getBoundingClientRect()
        onMapClick({
          x: ((t.clientX - rect.left)  / rect.width)  * 100,
          y: ((t.clientY - rect.top)   / rect.height) * 100,
        })
      }
    }
    if (e.touches.length === 0) touchRef.current = null
  }, [onMapClick])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: '100vh',
        cursor: dragging ? 'grabbing' : 'default',
        pointerEvents: disabled ? 'none' : 'auto',
        touchAction: 'none',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragging(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background + pins — scales/translates together */}
      <div
        ref={innerRef}
        style={{
          width:  '100%',
          height: '100%',
          backgroundImage: trips.length === 0
            ? `url('/assets/HERO_UPDATED_TRAVEL_WALL_CONCEPT_9_16_LUCE_NOTTURNA_CALDA.png')`
            : `url('/assets/HERO_UPDATED_TRAVEL_WALL_CONCEPT_9_16_LUCE_NOTTURNA_CALDA_SENZA_FOTO.png')`,
          backgroundSize:     'cover',
          backgroundPosition: 'center top',
          backgroundRepeat:   'no-repeat',
          position: 'relative',
          transformOrigin: 'center center',
          transform:  `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.05s',
        }}
      >
        {/* Dot pins — always visible for every trip */}
        {trips.map(trip => (
          <SmallPin
            key={trip.id}
            trip={trip}
            onSelect={setSelectedTrip}
            size={pinSize}
          />
        ))}

        {/* Polaroids — zoom-in only, max 8 most recent */}
        {polaroidTrips.map(trip => (
          <Polaroid
            key={`pol-${trip.id}`}
            trip={trip}
            onSelect={setSelectedTrip}
          />
        ))}

        {/* Trip detail popup */}
        {selectedTrip && (
          <TripPopup
            trip={selectedTrip}
            onDelete={id => { onDeleteTrip(id); setSelectedTrip(null) }}
            onClose={() => setSelectedTrip(null)}
          />
        )}
      </div>

      {/* Zoom hint */}
      <div
        className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded pointer-events-none z-40"
        style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(245,230,200,0.6)' }}
      >
        {showPolaroids ? 'Polaroid visibili' : 'Zoom in per le polaroid'}
        {!isLandscape && ' · Scroll per zoom'}
      </div>
    </div>
  )
}
