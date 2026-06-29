/**
 * LoginModal — trigger account (Sprint 4).
 *
 * Copy approvata: "Salva i tuoi ricordi. / Crea il tuo account."
 * Metodo funzionante = MAGIC LINK (passwordless, invariato — NO email+password
 * finché non deciso esplicitamente). I bottoni social sono PLACEHOLDER (manca
 * infrastruttura OAuth): ordine DINAMICO, Apple per primo solo su dispositivi
 * Apple, altrimenti Google per primo. Consenso marketing NON preselezionato.
 */

import { useState } from 'react'
import BeenThereLogo from '../components/BeenThereLogo'

const AMBER = '#C47820'
const DARK  = '#3d2009'
const SUB   = '#7a5c3a'

// Apple-first solo su device Apple (iOS/iPadOS/macOS/Safari), altrove Google-first
function isAppleDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = (navigator.userAgent || '') + ' ' + (navigator.platform || '')
  return /iphone|ipad|ipod|macintosh|mac os/i.test(ua)
}

const PROVIDERS = {
  apple:    { label: 'Continua con Apple' },
  google:   { label: 'Continua con Google' },
  facebook: { label: 'Continua con Facebook' },
}

function SocialButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 14px',
      background: '#fff', border: '1px solid #d4c4b0', borderRadius: 10,
      color: DARK, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif',
      cursor: 'pointer', textAlign: 'center',
    }}>{label}</button>
  )
}

function TrustBadge({ title }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontFamily: 'sans-serif', fontSize: 10, fontWeight: 600, color: DARK, margin: 0, lineHeight: 1.3 }}>{title}</p>
    </div>
  )
}

export default function LoginModal({ onClose, signInWithEmail }) {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState('idle') // idle | sending | sent | error
  const [marketing, setMarketing] = useState(false) // NON preselezionato (GDPR)
  const [soon,    setSoon]    = useState('')

  const order = isAppleDevice() ? ['apple', 'google', 'facebook'] : ['google', 'apple', 'facebook']

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const { error } = await signInWithEmail(email.trim())
    if (error) { setStatus('error'); return }
    setStatus('sent')
  }

  function comingSoon(provider) {
    setSoon(`${PROVIDERS[provider].label} — disponibile a breve`)
    setTimeout(() => setSoon(''), 2400)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(26,13,4,0.78)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '90vw', maxWidth: 380, margin: '32px auto',
          background: '#f8f4ef', border: '1px solid #d4c4b0', borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)', padding: '28px 22px 22px',
        }}
      >
        <button onClick={onClose} aria-label="Chiudi" style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#9a7a58', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <BeenThereLogo size={18} />
        </div>

        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>✉️</div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: DARK, fontSize: 18, margin: '0 0 8px' }}>Controlla la tua email</p>
            <p style={{ fontFamily: 'sans-serif', color: SUB, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              Ti abbiamo inviato un link magico a <strong>{email}</strong>.<br />
              Cliccalo per creare l'account e salvare i tuoi ricordi.
            </p>
          </div>
        ) : (
          <>
            {/* Titolo + sottotitolo (copy approvata) */}
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: DARK, fontSize: 22, fontWeight: 800, textAlign: 'center', margin: '0 0 2px' }}>
              Salva i tuoi ricordi.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif", color: AMBER, fontSize: 19, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
              Crea il tuo account.
            </p>
            <p style={{ fontFamily: 'sans-serif', color: SUB, fontSize: 13, textAlign: 'center', margin: '0 0 18px' }}>
              È gratis e ci vogliono meno di 30 secondi.
            </p>

            {/* Social — ordine dinamico, placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {order.map(p => (
                <SocialButton key={p} label={PROVIDERS[p].label} onClick={() => comingSoon(p)} />
              ))}
            </div>
            {soon && <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: AMBER, textAlign: 'center', margin: '8px 0 0' }}>{soon}</p>}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
              <div style={{ flex: 1, height: 1, background: '#d4c4b0' }} />
              <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB }}>oppure con email</span>
              <div style={{ flex: 1, height: 1, background: '#d4c4b0' }} />
            </div>

            {/* Email (magic link — passwordless) */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="la tua email" autoFocus required
                style={{ padding: '11px 14px', fontSize: 14, background: '#f0e8d8', border: '1px solid #c4aa84', borderRadius: 8, color: DARK, outline: 'none', fontFamily: 'sans-serif' }}
              />

              {/* Consenso marketing — NON preselezionato (GDPR) */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: 'sans-serif', fontSize: 11, color: SUB, cursor: 'pointer', lineHeight: 1.4 }}>
                <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 2 }} />
                Desidero ricevere consigli di viaggio e novità di BeenThere!
              </label>

              {status === 'error' && (
                <p style={{ color: '#a05030', fontSize: 12, fontFamily: 'sans-serif', margin: 0 }}>Errore nell'invio. Riprova.</p>
              )}

              <button type="submit" disabled={status === 'sending'} style={{
                padding: '13px', background: status === 'sending' ? '#c4aa84' : AMBER, border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display', serif",
                cursor: status === 'sending' ? 'not-allowed' : 'pointer', letterSpacing: '0.02em',
              }}>
                {status === 'sending' ? 'Invio…' : 'Crea account e salva i tuoi ricordi'}
              </button>
            </form>

            <p style={{ fontFamily: 'sans-serif', fontSize: 11, color: SUB, textAlign: 'center', margin: '12px 0 0', lineHeight: 1.4 }}>
              Creando l'account accetti i Termini e la Privacy.
            </p>

            {/* Trust badge */}
            <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingTop: 14, borderTop: '1px solid #e8ddd0' }}>
              <TrustBadge title="I tuoi ricordi sono al sicuro" />
              <TrustBadge title="Accesso ovunque" />
              <TrustBadge title="Niente è condiviso senza il tuo consenso" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
