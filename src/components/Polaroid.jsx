const CARD_W    = 72
const FRAME     = 4
const PHOTO_H   = 56
const CAPTION_H = 20
const CARD_H    = FRAME + PHOTO_H + CAPTION_H  // 80
const TIP_H     = 8   // triangular tip that points down to pin center
const TIP_W     = 6   // half-width of tip base

function rotation(id) {
  const seed = String(id ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const magnitude = 3 + (seed % 3)
  const direction = seed % 2 === 0 ? 1 : -1
  return direction * magnitude
}

export default function Polaroid({ trip, onSelect, isNew = false }) {
  const rot = rotation(trip.id)

  return (
    // Anchor at geographic point (pin center)
    <div
      style={{
        position: 'absolute',
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        // l'ultima/nuova polaroid sempre sopra tutte, anche con ricordi vicini
        zIndex: isNew ? 35 : 20,
        pointerEvents: 'none',
      }}
    >
      {/* Rotate entire assembly around pin center (0,0) */}
      <div style={{ transformOrigin: '0 0', transform: `rotate(${rot}deg)` }}>

        {/* Polaroid card — positioned so its bottom edge is at y=0 (pin center) */}
        <div
          style={{
            position: 'absolute',
            left: -(CARD_W / 2),
            top:  -(CARD_H + TIP_H),
            width:  CARD_W,
            height: CARD_H,
            background: '#fff',
            boxShadow: isNew ? '3px 7px 20px rgba(0,0,0,0.45)' : '2px 4px 10px rgba(0,0,0,0.30)',
            boxSizing: 'border-box',
            padding: `${FRAME}px ${FRAME}px 0`,
            cursor: 'pointer',
            pointerEvents: 'auto',
            // animazione discreta solo per l'ultima polaroid aggiunta (keyframe globale in GuestWall)
            animation: isNew ? 'bt-wall-pop 1.4s cubic-bezier(0.34,1.4,0.64,1) both' : undefined,
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

        {/* Triangular tip — point at (0,0) = pin center */}
        <div
          style={{
            position: 'absolute',
            top:  -TIP_H,
            left: -TIP_W,
            width: 0,
            height: 0,
            borderLeft:  `${TIP_W}px solid transparent`,
            borderRight: `${TIP_W}px solid transparent`,
            borderTop:   `${TIP_H}px solid white`,
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
