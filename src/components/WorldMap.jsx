import { useState, useRef, useCallback, useEffect } from 'react'
import Polaroid from './Polaroid'

const FRAMES = [
  '/assets/frame1.webp',
  '/assets/frame2.webp',
  '/assets/frame3.webp',
  '/assets/frame4.webp',
]

// Wooden decorative icons on oceans
function WoodPlane({ style }) {
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <g fill="#7A4020" stroke="#5a2e14" strokeWidth="0.5">
        {/* fuselage */}
        <ellipse cx="16" cy="16" rx="12" ry="3.5" transform="rotate(-35 16 16)" />
        {/* left wing */}
        <polygon points="16,16 7,22 10,16" />
        {/* right wing */}
        <polygon points="16,16 25,10 22,16" />
        {/* tail */}
        <polygon points="22,20 26,24 24,20" />
      </g>
    </svg>
  )
}

function WoodSailboat({ style }) {
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <g fill="#7A4020" stroke="#5a2e14" strokeWidth="0.6">
        {/* hull */}
        <path d="M4 22 Q16 26 28 22 L26 25 Q16 30 6 25 Z" />
        {/* mast */}
        <rect x="15" y="8" width="2" height="14" />
        {/* sail */}
        <polygon points="16,9 16,22 26,18" opacity="0.85" />
        {/* small sail */}
        <polygon points="16,9 16,18 8,15" opacity="0.7" />
      </g>
    </svg>
  )
}

function HeartPin({ trip, onSelect }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${trip.map_x}%`,
        top: `${trip.map_y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        cursor: 'pointer',
      }}
      onClick={e => { e.stopPropagation(); onSelect(trip) }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#E85555" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>
        <path d="M8 14s-6-4.35-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 3.65-6 8-6 8z" />
      </svg>
    </div>
  )
}

function SmallPin({ trip, onSelect }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${trip.map_x}%`,
        top: `${trip.map_y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: '#C87828',
        border: '2px solid white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
        cursor: 'pointer',
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
        top: `${trip.map_y}%`,
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
      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '7px solid #d4c4b0',
      }} />
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid #f8f4ef',
      }} />

      {/* Close */}
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
          fontSize: '11px', color: '#5c3d1e', marginTop: '6px',
          fontFamily: "'Caveat', cursive", fontSize: '13px',
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

function playCameraSound() {
  try {
    const ctx = new AudioContext()
    const sampleRate = ctx.sampleRate
    const duration = 0.08
    const bufferSize = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.pow(1 - i / bufferSize, 2)
      data[i] = (Math.random() * 2 - 1) * envelope
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2500
    filter.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.value = 0.4
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    source.onended = () => ctx.close()
  } catch (_) {}
}

export default function WorldMap({ trips, onMapClick, onDeleteTrip, lastAddedTripId, disabled }) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [hasDragged, setHasDragged] = useState(false)
  const [cameraFrame, setCameraFrame] = useState(null) // 0-3 during animation, null = idle
  const [selectedTrip, setSelectedTrip] = useState(null)

  const showPolaroids = scale > 1.5

  // Frame animation when new trip added
  useEffect(() => {
    if (!lastAddedTripId) return
    playCameraSound()
    let frame = 0
    setCameraFrame(0)
    const interval = setInterval(() => {
      frame++
      if (frame < FRAMES.length) {
        setCameraFrame(frame)
      } else if (frame === FRAMES.length) {
        // Hold last frame (frame4) for 600ms extra
        setTimeout(() => {
          setCameraFrame(null)
        }, 600)
        clearInterval(interval)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [lastAddedTripId])

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
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [dragging, dragStart])

  const handleMouseUp = useCallback(e => {
    setDragging(false)
    if (!hasDragged) {
      setSelectedTrip(null)
      if (onMapClick) {
        const inner = innerRef.current
        if (!inner) return
        const rect = inner.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        onMapClick({ x, y })
      }
    }
  }, [hasDragged, onMapClick])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: '100vh',
        cursor: dragging ? 'grabbing' : 'crosshair',
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setDragging(false)}
    >
      {/* Background + pins layer — scales/translates together */}
      <div
        ref={innerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/assets/HERO_LIVING_ROOM_REFERENCE.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          transformOrigin: 'center center',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.05s',
        }}
      >
        {/* Decorative wood icons on oceans */}
        {/* Atlantic Ocean */}
        <WoodPlane style={{ left: '27%', top: '38%' }} />
        {/* Pacific Ocean */}
        <WoodPlane style={{ left: '10%', top: '45%' }} />
        {/* Indian Ocean */}
        <WoodSailboat style={{ left: '64%', top: '58%' }} />

        {/* Trips */}
        {trips.map(trip => {
          if (trip.trip_type === 'dream') {
            return <HeartPin key={trip.id} trip={trip} onSelect={setSelectedTrip} />
          }
          if (showPolaroids) {
            return (
              <Polaroid
                key={trip.id}
                trip={trip}
                onDelete={onDeleteTrip}
                onSelect={setSelectedTrip}
              />
            )
          }
          return <SmallPin key={trip.id} trip={trip} onSelect={setSelectedTrip} />
        })}

        {/* Trip detail popup */}
        {selectedTrip && (
          <TripPopup
            trip={selectedTrip}
            onDelete={id => { onDeleteTrip(id); setSelectedTrip(null) }}
            onClose={() => setSelectedTrip(null)}
          />
        )}
      </div>

      {/* Camera animation overlay — fixed over entire container */}
      {cameraFrame !== null && (
        <div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            backgroundImage: `url('${FRAMES[cameraFrame]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Zoom hint */}
      <div
        className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded pointer-events-none z-40"
        style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(245,230,200,0.6)' }}
      >
        {showPolaroids ? 'Polaroid visibili' : 'Zoom in per le polaroid'} · Scroll per zoom · Click per aggiungere
      </div>
    </div>
  )
}
