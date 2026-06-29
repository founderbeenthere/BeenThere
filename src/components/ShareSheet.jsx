/**
 * ShareSheet — "Scegli cosa vuoi condividere" (Sprint 4, scheletro funzionale).
 *
 * Mockup 2 di riferimento. SOLO scelta: Wall completo vs singola foto + canali.
 * I canali social sono PLACEHOLDER: nessun posting reale verso Instagram/Facebook
 * (manca infrastruttura sicura — fuori scope di questo sprint).
 * Si apre solo per utenti con account (Explorer): il Guest ci arriva dopo la
 * creazione account (trigger "Condividi").
 */

import { useState } from 'react'
import BeenThereLogo from './BeenThereLogo'

const AMBER = '#C47820'
const DARK  = '#1a120a'
const SUB   = '#5a4030'
const BG    = '#f0ebe0'

function Channel({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: '#fff', border: '1px solid rgba(196,170,132,0.35)', borderRadius: 12,
      padding: '14px 10px', cursor: 'pointer',
    }}>
      <span style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600, color: DARK }}>{label}</span>
    </button>
  )
}

function OptionCard({ selected, onSelect, title, caption, children }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: '#fff',
        border: `2px solid ${selected ? AMBER : 'rgba(196,170,132,0.3)'}`,
        borderRadius: 16, padding: 14, marginBottom: 14,
        boxShadow: selected ? '0 4px 16px rgba(196,120,32,0.18)' : 'none',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600, color: DARK }}>{title}</span>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${selected ? AMBER : '#c8b898'}`,
          background: selected ? AMBER : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13,
        }}>{selected ? '✓' : ''}</span>
      </div>
      {children}
      <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB, margin: '10px 0 0', fontStyle: 'italic' }}>
        {caption}
      </p>
    </button>
  )
}

export default function ShareSheet({ trip, onClose }) {
  const [choice, setChoice] = useState('wall') // 'wall' | 'single'
  const [note, setNote]     = useState('')      // toast placeholder

  const dateStr = trip?.visit_date
    ? new Date(trip.visit_date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  function placeholderShare(channel) {
    // Nessun posting reale in questo sprint — solo segnale UX.
    setNote(`Pubblicazione su ${channel} in arrivo`)
    setTimeout(() => setNote(''), 2200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: BG, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
        <button onClick={onClose} aria-label="Chiudi" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: AMBER }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <BeenThereLogo size={18} />
        <span style={{ width: 22 }} />
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '4px 18px 32px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: DARK, textAlign: 'center', margin: '4px 0 18px' }}>
          Scegli cosa vuoi condividere
        </h1>

        {/* Opzione 1 — Wall completo */}
        <OptionCard
          selected={choice === 'wall'}
          onSelect={() => setChoice('wall')}
          title="Ho aggiornato il mio Wall su BeenThere!"
          caption="Condividi l'immagine del tuo Wall completo."
        >
          <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', background: '#e8dfd0' }}>
            <img src="/assets/map-hero.png" alt="Anteprima Wall" style={{ width: '100%', display: 'block' }} draggable={false} />
          </div>
        </OptionCard>

        {/* Opzione 2 — singola foto */}
        <OptionCard
          selected={choice === 'single'}
          onSelect={() => setChoice('single')}
          title="Nuova foto su BeenThere!"
          caption="Condividi solo l'ultima foto aggiunta."
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 72, height: 90, flexShrink: 0, background: '#fff', padding: '4px 4px 0', boxShadow: '1px 2px 8px rgba(0,0,0,0.18)' }}>
              <div style={{ width: '100%', height: 66, overflow: 'hidden', background: '#d8cfc4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {trip?.photo_url || trip?.photo_src
                  ? <img src={trip.photo_url || trip.photo_src} alt={trip?.place_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <span style={{ fontSize: 24 }}>{trip?.emoji || '📍'}</span>}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600, color: DARK, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📍 {trip?.place_name || 'La tua foto'}
              </p>
              {dateStr && <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB, margin: 0 }}>{dateStr}</p>}
            </div>
          </div>
        </OptionCard>

        {/* Canali */}
        <p style={{ fontFamily: 'sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: SUB, textAlign: 'center', margin: '20px 0 12px' }}>
          PUBBLICA SU:
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Channel label="Facebook"  onClick={() => placeholderShare('Facebook')} />
          <Channel label="Instagram" onClick={() => placeholderShare('Instagram')} />
        </div>

        {note && (
          <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: AMBER, textAlign: 'center', marginTop: 14 }}>
            {note}
          </p>
        )}
      </div>
    </div>
  )
}
