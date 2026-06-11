// Dimensions — keep in sync with the rendered card
const CARD_W     = 70   // outer width px
const FRAME      = 4    // white border on all sides
const PHOTO_H    = 50   // photo area height
const CAPTION_H  = 16   // bottom white strip for caption
const CARD_H     = FRAME + PHOTO_H + CAPTION_H  // 91
const TIP_H      = 9    // triangle height (= half-base)

function rotation(id) {
  const seed = String(id ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return (seed % 11) - 5  // -5..+5 deg, deterministic
}

export default function Polaroid({ trip, onSelect }) {
  // pin on right side of screen → card opens left (tip on right edge of card)
  const openLeft = (trip.map_x ?? 50) > 60

  // tipX = distance from card's left edge to the tip apex
  const tipX = openLeft ? CARD_W : 0

  // Position card group so tip apex sits exactly at local (0,0) = pin center
  const groupLeft = -tipX
  const groupTop  = -(CARD_H + TIP_H)

  const rot = rotation(trip.id)

  return (
    <div
      style={{
        position: 'absolute',
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Geographic dot pin — center at local (0,0) */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0,
          transform: 'translate(-50%, -50%)',
          width: 10, height: 10,
          borderRadius: '50%',
          background: '#C87828',
          border: '2px solid #fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          zIndex: 2,
        }}
        onClick={e => { e.stopPropagation(); onSelect?.(trip) }}
      />

      {/* Card + tip — tip apex fixed at (0,0) even after rotation */}
      <div
        style={{
          position: 'absolute',
          left: groupLeft,
          top:  groupTop,
          transformOrigin: `${tipX}px ${CARD_H + TIP_H}px`,
          transform: `rotate(${rot}deg)`,
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
        onClick={e => { e.stopPropagation(); onSelect?.(trip) }}
      >
        {/* Polaroid card */}
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            background: '#fff',
            boxSizing: 'border-box',
            padding: `${FRAME}px ${FRAME}px 0`,
            boxShadow: '2px 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {/* Photo / emoji placeholder */}
          <div
            style={{
              width: '100%',
              height: PHOTO_H,
              overflow: 'hidden',
              background: '#d8cfc4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {trip.photo_url ? (
              <img
                src={trip.photo_url}
                alt={trip.place_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                draggable={false}
              />
            ) : (
              <span style={{ fontSize: 28, lineHeight: 1 }}>{trip.emoji || '📍'}</span>
            )}
          </div>

          {/* Caption strip */}
          <div
            style={{
              height: CAPTION_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 11,
                color: '#3d2009',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: CARD_W - FRAME * 2,
              }}
            >
              {trip.place_name}
            </span>
          </div>
        </div>

        {/* Triangle tip — outer (border) */}
        <div style={{
          position: 'absolute',
          bottom: -TIP_H,
          left: tipX - TIP_H,
          width: 0, height: 0,
          borderLeft:  `${TIP_H}px solid transparent`,
          borderRight: `${TIP_H}px solid transparent`,
          borderTop:   `${TIP_H}px solid rgba(0,0,0,0.15)`,
        }} />
        {/* Triangle tip — inner (white fill) */}
        <div style={{
          position: 'absolute',
          bottom: -(TIP_H - 1),
          left: tipX - (TIP_H - 1),
          width: 0, height: 0,
          borderLeft:  `${TIP_H - 1}px solid transparent`,
          borderRight: `${TIP_H - 1}px solid transparent`,
          borderTop:   `${TIP_H - 1}px solid #fff`,
        }} />
      </div>
    </div>
  )
}
