import { useEffect } from 'react'
import { geoToPercent } from '../utils/geo'

const CARD_W = 88
const CARD_H = 110
const FRAME  = 5
const CAP_H  = 22

// Puntina dorata BeenThere — SVG inline, nessun asset esterno
const GoldPin = () => (
  <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="9" r="8.5" fill="#D4860A"/>
    <circle cx="10" cy="9" r="8.5" stroke="#A05808" strokeWidth="0.7"/>
    <ellipse cx="7.2" cy="6.2" rx="2.4" ry="1.7" fill="rgba(255,235,140,0.48)"/>
    <ellipse cx="10" cy="17.5" rx="3.8" ry="1.1" fill="rgba(0,0,0,0.12)"/>
    <path d="M10 17.5 L10 24" stroke="#A05808" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
)

export default function WowMoment({ trip, onDone }) {
  const pos = (trip?.lat != null && trip?.lng != null)
    ? geoToPercent(trip.lat, trip.lng)
    : { left: 48, top: 42 }

  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a0d04',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      <style>{`
        @keyframes bt-mapIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes bt-fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Vento: traiettoria irregolare dall'alto-destra verso la posizione */
        @keyframes bt-wind {
          0%   { opacity:0; transform: translate(110px,-185px) rotate(-7deg) scaleY(1); }
          11%  { opacity:1; transform: translate(68px,-120px)  rotate(-3deg) scaleY(1); }
          28%  { transform: translate(24px,-68px)   rotate(4deg)  scaleY(1); }
          50%  { transform: translate(-8px,-20px)   rotate(-1deg) scaleY(1); }
          65%  { transform: translate(2px, 7px)     rotate(3.5deg) scaleY(0.96); }
          78%  { transform: translate(4px,-3px)     rotate(1deg)  scaleY(1.02); }
          90%  { transform: translate(-1px,1px)     rotate(-2.5deg) scaleY(1); }
          100% { transform: translate(0,0)          rotate(-2deg) scaleY(1); }
        }

        /* Puntina che "fissa" la polaroid — molla elastica */
        @keyframes bt-pin {
          0%   { opacity:0; transform:translateX(-50%) translateY(-18px) scale(0.55); }
          55%  { opacity:1; transform:translateX(-50%) translateY(3px)  scale(1.18); }
          75%  { transform:translateX(-50%) translateY(-2px) scale(0.93); }
          100% { transform:translateX(-50%) translateY(0)   scale(1); }
        }

        /* Sparkle 1 — alto sinistra */
        @keyframes bt-sp1 {
          0%   { opacity:0; transform:translate(0,0) scale(0); }
          45%  { opacity:1; transform:translate(-11px,-13px) scale(1); }
          100% { opacity:0; transform:translate(-17px,-20px) scale(0.1); }
        }
        /* Sparkle 2 — alto destra */
        @keyframes bt-sp2 {
          0%   { opacity:0; transform:translate(0,0) scale(0); }
          45%  { opacity:1; transform:translate(11px,-11px) scale(1); }
          100% { opacity:0; transform:translate(18px,-18px) scale(0.1); }
        }
        /* Sparkle 3 — destra */
        @keyframes bt-sp3 {
          0%   { opacity:0; transform:translate(0,0) scale(0); }
          40%  { opacity:1; transform:translate(15px,-3px) scale(1); }
          100% { opacity:0; transform:translate(22px,-4px) scale(0.1); }
        }
      `}</style>

      {/* Titolo */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        color: '#f5e6c8', fontSize: 20, fontWeight: 700,
        margin: '0 0 16px', textAlign: 'center', padding: '0 24px',
        animation: 'bt-fadeUp 0.35s ease-out 0.1s both',
      }}>
        Nuovo ricordo aggiunto!
      </p>

      {/* Mappa */}
      <div style={{
        width: '100%', maxWidth: 480, position: 'relative',
        animation: 'bt-mapIn 0.4s ease-out both',
      }}>
        <img
          src="/assets/map-hero.png"
          alt="mappa"
          style={{ width: '100%', display: 'block' }}
          draggable={false}
        />

        {/* Contenitore polaroid — centrato via margin, animato col vento */}
        <div style={{
          position: 'absolute',
          left:      `${pos.left}%`,
          top:       `${pos.top}%`,
          width:     CARD_W,
          height:    CARD_H,
          marginLeft: -CARD_W / 2,
          marginTop:  -CARD_H / 2,
          zIndex: 10,
          animation: 'bt-wind 1.5s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s both',
        }}>

          {/* Puntina dorata — arriva dopo l'atterraggio */}
          <div style={{
            position: 'absolute',
            top: -11,
            left: '50%',
            zIndex: 20,
            animation: 'bt-pin 0.42s cubic-bezier(0.34,1.56,0.64,1) 1.65s both',
          }}>
            <GoldPin />
          </div>

          {/* Sparkle intorno alla puntina (discr­eti) */}
          {[
            { anim: 'bt-sp1', delay: '1.9s',  size: 6, top: -8,  left: '50%' },
            { anim: 'bt-sp2', delay: '2.0s',  size: 5, top: -8,  left: '50%' },
            { anim: 'bt-sp3', delay: '1.95s', size: 5, top: -5,  left: '50%' },
          ].map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: '#D4860A',
              top:  s.top,
              left: s.left,
              zIndex: 18,
              animation: `${s.anim} 0.5s ease-out ${s.delay} both`,
              pointerEvents: 'none',
            }}/>
          ))}

          {/* Card polaroid */}
          <div style={{
            width: CARD_W, height: CARD_H,
            background: '#fff',
            boxShadow: '0 6px 28px rgba(0,0,0,0.50)',
            padding: `${FRAME}px ${FRAME}px 0`,
          }}>
            <div style={{
              width: '100%',
              height: CARD_H - FRAME - CAP_H,
              overflow: 'hidden',
              background: '#c8b89a',
            }}>
              {trip?.photo_src && (
                <img
                  src={trip.photo_src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </div>
            <div style={{
              height: CAP_H,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px',
            }}>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 11, color: '#1a120a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: CARD_W - 14,
              }}>
                {trip?.place_name || 'Il mio posto'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sottotitolo */}
      <p style={{
        fontFamily: 'sans-serif',
        color: '#9a7a58', fontSize: 13,
        margin: '18px 0 0', textAlign: 'center',
        animation: 'bt-fadeUp 0.35s ease-out 0.25s both',
      }}>
        {trip?.place_name ? `📍 ${trip.place_name}` : 'Posizionato sulla mappa'}
      </p>

    </div>
  )
}
