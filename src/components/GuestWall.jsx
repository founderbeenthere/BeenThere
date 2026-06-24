/**
 * GuestWall — Wall visivo per lo stato TRY (non autenticato).
 *
 * Asset mappa: /assets/map-hero.png
 * Mappa in legno su sfondo bianco/crema, senza living room. ✅ Confermato.
 * Quando disponibile l'asset wall definitivo, sostituire solo la riga <img src="...">.
 *
 * Nota posizionamento: geoToPercent è calibrato per le immagini del wall principale
 * (9:16). map-hero.png è 16:9. Posizioni approssimate ma geograficamente corrette.
 * Accettato per Sprint 2A.
 *
 * Auth: nessuna. "Salva i tuoi ricordi" chiama onSaveClick prop (da MapPage).
 */

import { useNavigate } from 'react-router-dom'
import Polaroid from './Polaroid'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'
const LIMIT = 3

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontSize: 20 }}>📌</span>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
        <span style={{ color: DARK }}>Been</span>
        <span style={{ color: AMBER }}>There</span>
      </span>
    </div>
  )
}

function CounterPill({ count }) {
  return (
    <div style={{
      padding: '4px 12px',
      background: AMBER,
      borderRadius: 20,
      color: '#fff',
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 600,
      letterSpacing: '0.03em',
    }}>
      {count}/{LIMIT} ricordi
    </div>
  )
}

export default function GuestWall({ guestTrips, onSaveClick }) {
  const navigate = useNavigate()

  const count    = guestTrips.length
  const hasTrips = count > 0
  const atLimit  = count >= LIMIT

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: BG,
        borderBottom: hasTrips ? '1px solid rgba(196,170,132,0.25)' : 'none',
        flexShrink: 0,
        zIndex: 30,
      }}>
        <Logo />
        {hasTrips && <CounterPill count={count} />}
      </header>

      {/* ── MAPPA + POLAROID ── */}
      {/* map-hero.png come <img> così Polaroid si posiziona correttamente */}
      <div style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
        <img
          src="/assets/map-hero.png"
          alt="mappa BeenThere"
          style={{ width: '100%', display: 'block' }}
          draggable={false}
        />
        {guestTrips.map(trip => (
          <Polaroid key={trip.id} trip={trip} onSelect={() => {}} />
        ))}
      </div>

      {/* ── CONTENUTO SOTTO MAPPA ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: hasTrips ? 'flex-end' : 'center',
        padding: '28px 24px 40px',
        gap: 16,
      }}>

        {/* Empty state */}
        {!hasTrips && (
          <>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 700, color: DARK,
              margin: 0, textAlign: 'center',
            }}>
              Il tuo wall ti aspetta
            </p>
            <p style={{
              fontFamily: 'sans-serif', fontSize: 14,
              color: SUB, margin: 0, textAlign: 'center', lineHeight: 1.5,
            }}>
              Carica la tua prima foto e posizionala<br />
              nel posto del mondo in cui è stata scattata.
            </p>
            <button onClick={() => navigate('/try')} style={ctaPrimary}>
              📸 Carica la tua prima foto
            </button>
          </>
        )}

        {/* Con ricordi */}
        {hasTrips && (
          <>
            <button onClick={onSaveClick} style={ctaPrimary}>
              Salva i tuoi ricordi
            </button>
            <button
              onClick={() => { if (!atLimit) navigate('/try') }}
              disabled={atLimit}
              style={{
                ...ctaSecondary,
                opacity: atLimit ? 0.45 : 1,
                cursor:  atLimit ? 'not-allowed' : 'pointer',
              }}
            >
              {atLimit ? 'Limite raggiunto (3/3)' : '+ Aggiungi una foto'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}

const ctaPrimary = {
  width: '100%', maxWidth: 440,
  padding: '15px 24px',
  background: AMBER, border: 'none', borderRadius: 40,
  color: '#fff', fontSize: 16, fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  letterSpacing: '0.03em', cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(196,120,32,0.3)',
}

const ctaSecondary = {
  width: '100%', maxWidth: 440,
  padding: '13px 24px',
  background: 'transparent',
  border: `1.5px solid ${AMBER}`,
  borderRadius: 40,
  color: AMBER, fontSize: 15, fontWeight: 600,
  fontFamily: "'Playfair Display', serif",
  letterSpacing: '0.02em',
}
