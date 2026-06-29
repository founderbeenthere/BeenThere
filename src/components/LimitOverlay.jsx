/**
 * LimitOverlay — limite ricordi Guest (Sprint 4.1).
 *
 * Mostrato quando il Guest raggiunge / supera i 3 ricordi della modalità Try.
 * CTA → creazione account Explorer (trigger di conversione 2: "vuoi continuare").
 * Copy fornita dal founder.
 */

import BeenThereLogo from './BeenThereLogo'

const AMBER = '#C47820'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

export default function LimitOverlay({ onCreateAccount, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,13,4,0.55)' }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 101, width: '88vw', maxWidth: 360,
          background: '#f8f4ef', borderRadius: 16,
          boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
          padding: '30px 24px 22px', textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <BeenThereLogo size={18} />
        </div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: DARK, margin: '0 0 10px', lineHeight: 1.25 }}>
          Hai raggiunto il limite dei ricordi della modalità Try.
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: SUB, margin: '0 0 22px', lineHeight: 1.5 }}>
          Crea gratuitamente il tuo account Explorer per aggiungere ricordi illimitati.
        </p>

        <button
          onClick={onCreateAccount}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 12,
            background: AMBER, border: 'none', color: '#fff',
            fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.02em', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(196,120,32,0.35)',
          }}
        >
          Crea il mio account
        </button>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: SUB, fontFamily: 'sans-serif', fontSize: 13, cursor: 'pointer', marginTop: 12, textDecoration: 'underline' }}
        >
          Più tardi
        </button>
      </div>
    </>
  )
}
