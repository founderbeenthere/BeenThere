import { useState } from 'react'

const CARD_W = 90
const CARD_BODY_H = 112 // 6 top + 70 photo + 4 gap + ~14 caption + 18 bottom
const TIP_H = 10        // triangle height (= half-width)

export default function Polaroid({ trip, onSelect }) {
  const [hovered, setHovered] = useState(false)

  const rotation = trip.rotation ?? (((trip.id?.charCodeAt(0) ?? 0) % 21) - 10)

  // pin is on the right side of the screen → open card to the left (tip on right edge)
  // pin is on the left  side of the screen → open card to the right (tip on left edge)
  const openLeft = (trip.map_x ?? 50) > 55

  // tipX = horizontal distance from card's left edge to the tip apex
  const tipX = openLeft ? CARD_W : 0

  // Position the card group so the tip apex sits at local (0, 0)
  // (the wrapper div is at map_x%, map_y% — that's also where the pin dot center is)
  const groupLeft = -tipX
  const groupTop = -(CARD_BODY_H + TIP_H)

  // Rotation origin: the tip apex within the group's own coordinate system
  const rotOriginX = `${tipX}px`
  const rotOriginY = `${CARD_BODY_H + TIP_H}px`

  return (
    <div
      style={{
        position: 'absolute',
        left: `${trip.map_x}%`,
        top: `${trip.map_y}%`,
        zIndex: hovered ? 50 : 10,
        pointerEvents: 'none', // children handle events individually
      }}
    >
      {/* Geographic pin dot — centered at (0,0) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#C87828',
          border: '2px solid white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          zIndex: 2,
        }}
        onClick={e => { e.stopPropagation(); if (onSelect) onSelect(trip) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Polaroid card + tip, tip apex anchored at (0,0) */}
      <div
        style={{
          position: 'absolute',
          left: groupLeft,
          top: groupTop,
          transformOrigin: `${rotOriginX} ${rotOriginY}`,
          transform: `rotate(${rotation}deg) scale(${hovered ? 1.08 : 1})`,
          transition: 'transform 0.2s ease',
          filter: hovered
            ? 'drop-shadow(0 10px 24px rgba(0,0,0,0.6))'
            : 'drop-shadow(0 4px 10px rgba(0,0,0,0.38))',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); if (onSelect) onSelect(trip) }}
      >
        {/* Card body */}
        <div
          style={{
            width: CARD_W,
            background: '#f8f4ef',
            padding: '6px 6px 18px',
            border: '1px solid #d4c4b0',
          }}
        >
          {/* Photo */}
          <div style={{ width: '100%', height: 70, background: '#c8b89a', overflow: 'hidden' }}>
            {trip.photo_url ? (
              <img
                src={trip.photo_url}
                alt={trip.place_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                background: 'linear-gradient(135deg, #c8b89a, #a89070)',
              }}>
                {trip.emoji || '📍'}
              </div>
            )}
          </div>

          {/* Caption */}
          <div style={{
            textAlign: 'center',
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: "'Caveat', cursive",
            fontSize: 11,
            color: '#5c3d1e',
            lineHeight: 1.2,
          }}>
            {trip.place_name}
          </div>
        </div>

        {/* Triangle tip — outer (border color) */}
        <div style={{
          position: 'absolute',
          bottom: -TIP_H,
          left: tipX - TIP_H,
          width: 0, height: 0,
          borderLeft: `${TIP_H}px solid transparent`,
          borderRight: `${TIP_H}px solid transparent`,
          borderTop: `${TIP_H}px solid #d4c4b0`,
        }} />
        {/* Triangle tip — inner (fill color) */}
        <div style={{
          position: 'absolute',
          bottom: -(TIP_H - 1),
          left: tipX - (TIP_H - 1),
          width: 0, height: 0,
          borderLeft: `${TIP_H - 1}px solid transparent`,
          borderRight: `${TIP_H - 1}px solid transparent`,
          borderTop: `${TIP_H - 1}px solid #f8f4ef`,
        }} />
      </div>
    </div>
  )
}
