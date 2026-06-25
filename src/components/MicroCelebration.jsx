import { useState, useEffect } from 'react'

const AMBER = '#C47820'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

const CARD_W   = 72
const FRAME    = 4
const PHOTO_H  = 56
const CAP_H    = 18
const CARD_H   = FRAME + PHOTO_H + CAP_H

// Puntina dorata — stessa di WowMoment
const GoldPin = () => (
  <svg width="22" height="28" viewBox="0 0 20 25" fill="none">
    <circle cx="10" cy="9" r="8.5" fill="#D4860A"/>
    <circle cx="10" cy="9" r="8.5" stroke="#A05808" strokeWidth="0.7"/>
    <ellipse cx="7.2" cy="6.2" rx="2.4" ry="1.7" fill="rgba(255,235,140,0.48)"/>
    <path d="M10 17.5 L10 24" stroke="#A05808" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
)

const DISMISS_AFTER = 4  // secondi

export default function MicroCelebration({ trip, onDismiss }) {
  const [visible,   setVisible]   = useState(true)
  const [countdown, setCountdown] = useState(DISMISS_AFTER)
  const [copied,    setCopied]    = useState(false)

  // Countdown + auto-dismiss
  useEffect(() => {
    if (!visible) return
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(tick); setVisible(false); onDismiss?.(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [visible, onDismiss])

  if (!visible) return null

  async function handleShare() {
    const url  = `${window.location.origin}/try`
    const text = trip?.place_name
      ? `Ho aggiunto ${trip.place_name} al mio wall BeenThere!`
      : 'Guarda il mio wall su BeenThere!'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BeenThere', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch { /* cancelled */ }
  }

  function handleContinua() {
    setVisible(false)
    onDismiss?.()
  }

  // Data formattata
  const dateStr = trip?.visit_date
    ? new Date(trip.visit_date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <>
      <style>{`
        @keyframes mc-fadein { from { opacity:0 } to { opacity:1 } }
        @keyframes mc-card   { from { opacity:0; transform:translateX(-50%) translateY(calc(-50% + 12px)) scale(0.93) } to { opacity:1; transform:translateX(-50%) translateY(-50%) scale(1) } }
        @keyframes mc-sp1    { 0%{opacity:0;transform:translate(0,0) scale(0)} 50%{opacity:.7;transform:translate(-14px,-16px) scale(1)} 100%{opacity:0;transform:translate(-20px,-24px) scale(0)} }
        @keyframes mc-sp2    { 0%{opacity:0;transform:translate(0,0) scale(0)} 50%{opacity:.7;transform:translate(14px,-14px) scale(1)} 100%{opacity:0;transform:translate(20px,-20px) scale(0)} }
        @keyframes mc-sp3    { 0%{opacity:0;transform:translate(0,0) scale(0)} 50%{opacity:.6;transform:translate(0px,-20px) scale(1)} 100%{opacity:0;transform:translate(0,-28px) scale(0)} }
      `}</style>

      {/* Overlay sfondo — semi-trasparente, wall visibile sotto */}
      <div
        onClick={handleContinua}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(26,13,4,0.40)',
          animation: 'mc-fadein 0.25s ease-out both',
        }}
      />

      {/* Card — centrata verticalmente e orizzontalmente */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          zIndex: 101,
          width: '88vw',
          maxWidth: 340,
          background: '#f8f4ef',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(0,0,0,0.38)',
          padding: '36px 24px 20px',
          textAlign: 'center',
          animation: 'mc-card 0.3s cubic-bezier(0.34,1.3,0.64,1) both',
        }}
      >
        {/* Puntina che "fissa" la card */}
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5,
        }}>
          <GoldPin />
          {/* Sparkle intorno alla puntina */}
          {[
            { anim:'mc-sp1', delay:'0.4s', size:5 },
            { anim:'mc-sp2', delay:'0.5s', size:4 },
            { anim:'mc-sp3', delay:'0.45s', size:4 },
          ].map((s, i) => (
            <div key={i} style={{
              position:'absolute', width:s.size, height:s.size,
              borderRadius:'50%', background: AMBER,
              top:'50%', left:'50%',
              animation: `${s.anim} 0.55s ease-out ${s.delay} both`,
              pointerEvents:'none',
            }}/>
          ))}
        </div>

        {/* Titolo */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 700, color: DARK,
          margin: '0 0 2px',
        }}>
          Nuovo ricordo
        </p>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 22, color: AMBER,
          margin: '0 0 16px',
        }}>
          aggiunto!
        </p>

        {/* Mini polaroid */}
        <div style={{
          display: 'inline-block',
          width: CARD_W, height: CARD_H,
          background: '#fff',
          boxShadow: '2px 4px 12px rgba(0,0,0,0.22)',
          padding: `${FRAME}px ${FRAME}px 0`,
          transform: 'rotate(-2deg)',
          marginBottom: 14,
        }}>
          <div style={{
            width: '100%', height: PHOTO_H,
            overflow: 'hidden', background: '#d8cfc4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {trip?.photo_url ? (
              <img src={trip.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            ) : (
              <span style={{ fontSize: 26 }}>{trip?.emoji || '📍'}</span>
            )}
          </div>
          <div style={{ height: CAP_H, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px' }}>
            <span style={{ fontFamily:"'Caveat', cursive", fontSize:10, color: DARK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth: CARD_W - 10 }}>
              {trip?.place_name || 'Il mio posto'}
            </span>
          </div>
        </div>

        {/* Luogo + data */}
        <div style={{ marginBottom: 18 }}>
          {trip?.place_name && (
            <p style={{ fontFamily:'sans-serif', fontSize:14, color: DARK, fontWeight:600, margin:'0 0 2px' }}>
              📍 {trip.place_name}
            </p>
          )}
          {dateStr && (
            <p style={{ fontFamily:'sans-serif', fontSize:12, color: SUB, margin:0 }}>
              📅 {dateStr}
            </p>
          )}
        </div>

        {/* Pulsanti */}
        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          <button onClick={handleShare} style={btnSecondary}>
            {copied ? '✓ Link copiato' : 'Condividi'}
          </button>
          <button onClick={handleContinua} style={btnPrimary}>
            Continua
          </button>
        </div>

        {/* Countdown */}
        <p style={{ fontFamily:'sans-serif', fontSize:11, color:'#b09070', margin:0 }}>
          Questo messaggio scomparirà tra {countdown} second{countdown === 1 ? 'o' : 'i'}
        </p>
      </div>
    </>
  )
}

const btnPrimary = {
  flex: 1, padding: '10px 0',
  background: AMBER, border: 'none', borderRadius: 8,
  color: '#fff', fontSize: 14, fontWeight: 700,
  fontFamily: "'Playfair Display', serif", cursor: 'pointer',
}

const btnSecondary = {
  flex: 1, padding: '10px 0',
  background: 'transparent', border: `1.5px solid ${AMBER}`, borderRadius: 8,
  color: AMBER, fontSize: 14, fontWeight: 600,
  fontFamily: "'Playfair Display', serif", cursor: 'pointer',
}
