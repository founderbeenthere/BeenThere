const CARD_W    = 72
const FRAME     = 4
const PHOTO_H   = 56
const CAPTION_H = 20
const CARD_H    = FRAME + PHOTO_H + CAPTION_H  // 80
const PIN_D     = 8
const PIN_R     = PIN_D / 2                    // 4

function rotation(id) {
  const seed = String(id ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const magnitude = 3 + (seed % 3)         // 3, 4 or 5 degrees
  const direction = seed % 2 === 0 ? 1 : -1
  return direction * magnitude
}

export default function Polaroid({ trip, onSelect }) {
  const rot = rotation(trip.id)

  return (
    // Geographic anchor — pin center sits here
    <div
      style={{
        position: 'absolute',
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Rotate the whole assembly around the geographic point (0,0) */}
      <div
        style={{
          transformOrigin: '0 0',
          transform: `rotate(${rot}deg)`,
        }}
      >
        {/* Orange anchor pin — centered at (0,0) */}
        <div
          style={{
            position: 'absolute',
            left: -PIN_R,
            top:  -PIN_R,
            width:  PIN_D,
            height: PIN_D,
            borderRadius: '50%',
            background: '#E8A050',
            border: '1.5px solid rgba(255,255,255,0.75)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 2,
          }}
          onClick={e => { e.stopPropagation(); onSelect?.(trip) }}
        />

        {/* Polaroid card — hangs below the pin */}
        <div
          style={{
            position: 'absolute',
            left: -(CARD_W / 2),
            top:  PIN_R + 2,
            width:  CARD_W,
            height: CARD_H,
            background: '#fff',
            boxShadow: '2px 4px 8px rgba(0,0,0,0.25)',
            boxSizing: 'border-box',
            padding: `${FRAME}px ${FRAME}px 0`,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
          onClick={e => { e.stopPropagation(); onSelect?.(trip) }}
        >
          {/* Photo area */}
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
              <span style={{ fontSize: 24, lineHeight: 1 }}>{trip.emoji || '📍'}</span>
            )}
          </div>

          {/* Caption strip */}
          <div
            style={{
              height: CAPTION_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 9,
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
      </div>
    </div>
  )
}
