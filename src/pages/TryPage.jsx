/**
 * /try — entry point QR / social / test
 *
 * Flow:
 *   1. Hero + CTA "Carica una foto"
 *   2. Selezione foto → polaroid preview animata
 *   3. Form luogo (opzionale ma consigliato)
 *   4. "Salva il tuo viaggio" → Magic Link (login on-demand)
 *
 * Design: NESSUNA scelta visuale autonoma.
 * Tutto il layout finale sarà guidato dagli asset forniti dal team.
 */

import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

// ─── costanti polaroid preview ────────────────────────────────────────────────
const CARD_W   = 200
const PHOTO_H  = 160
const FRAME    = 6
const CAP_H    = 32
const CARD_H   = FRAME + PHOTO_H + CAP_H

export default function TryPage() {
  const { user, signInWithEmail } = useAuth()

  const [step,         setStep]         = useState('hero')   // hero | preview | save | sent
  const [photoSrc,     setPhotoSrc]     = useState(null)     // data URL
  const [placeName,    setPlaceName]    = useState('')
  const [email,        setEmail]        = useState('')
  const [sendingLink,  setSendingLink]  = useState(false)
  const fileRef = useRef(null)

  // ── step 1: foto selezionata ────────────────────────────────────────────────
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhotoSrc(ev.target.result); setStep('preview') }
    reader.readAsDataURL(file)
  }

  // ── step 3: Magic Link ──────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSendingLink(true)
    await signInWithEmail(email.trim())
    setSendingLink(false)
    setStep('sent')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1a0d04',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
      }}
    >

      {/* ── HERO ── */}
      {/* TODO: replace with final BeenThere /try hero asset */}
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          aspectRatio: '4/3',
          background: '#2a1205',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#7a5c3a', fontFamily: 'sans-serif', fontSize: 13, opacity: 0.5 }}>
          [ hero asset — da inserire ]
        </span>
      </div>

      {/* ── CORPO ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >

        {/* STEP: hero — CTA iniziale */}
        {step === 'hero' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={ctaStyle}
            >
              📸 Carica una foto
            </button>
          </>
        )}

        {/* STEP: preview — polaroid + campo luogo */}
        {step === 'preview' && photoSrc && (
          <>
            {/* Polaroid preview */}
            <div
              style={{
                width: CARD_W,
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                padding: `${FRAME}px ${FRAME}px 0`,
                transform: 'rotate(-2deg)',
              }}
            >
              <div style={{ width: '100%', height: PHOTO_H, overflow: 'hidden' }}>
                <img
                  src={photoSrc}
                  alt="anteprima"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  height: CAP_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px',
                }}
              >
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 15,
                  color: '#3d2009',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: CARD_W - 24,
                }}>
                  {placeName || 'Il tuo posto'}
                </span>
              </div>
            </div>

            {/* Campo luogo opzionale */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>Dove sei stato? (opzionale)</label>
              <input
                type="text"
                placeholder="es. Roma, Tokyo, Parigi…"
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={() => setStep('save')} style={ctaStyle}>
              Salva il tuo viaggio →
            </button>

            <button onClick={() => { setStep('hero'); setPhotoSrc(null); setPlaceName('') }} style={ghostStyle}>
              Cambia foto
            </button>
          </>
        )}

        {/* STEP: save — Magic Link */}
        {step === 'save' && (
          <>
            {/* Polaroid ridotta */}
            <div style={{ width: 100, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', padding: '3px 3px 0', transform: 'rotate(-2deg)', flexShrink: 0 }}>
              <div style={{ width: '100%', height: 80, overflow: 'hidden' }}>
                <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 11, color: '#3d2009' }}>{placeName || 'Il tuo posto'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", color: '#f5e6c8', fontSize: 20, margin: '0 0 8px' }}>
                Bella foto!
              </p>
              <p style={{ fontFamily: 'sans-serif', color: '#9a7a58', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Inserisci la tua email per salvare il viaggio sul tuo muro personale.<br />
                Nessuna password — solo un link magico.
              </p>
            </div>

            <form onSubmit={handleSave} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="la tua email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
                style={inputStyle}
              />
              <button type="submit" disabled={sendingLink} style={ctaStyle}>
                {sendingLink ? 'Invio…' : 'Mandami il link ✉️'}
              </button>
            </form>

            {user && (
              <p style={{ fontFamily: 'sans-serif', color: '#7a9a5a', fontSize: 13, textAlign: 'center' }}>
                Sei già loggato come {user.email}.<br />
                <a href="/" style={{ color: '#E8A050', textDecoration: 'none' }}>Vai al tuo muro →</a>
              </p>
            )}
          </>
        )}

        {/* STEP: sent — conferma email */}
        {step === 'sent' && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#f5e6c8', fontSize: 22, margin: '0 0 12px' }}>
              Controlla la tua email
            </p>
            <p style={{ fontFamily: 'sans-serif', color: '#9a7a58', fontSize: 14, lineHeight: 1.6 }}>
              Ti abbiamo inviato un link a <strong style={{ color: '#c4aa84' }}>{email}</strong>.<br />
              Cliccalo per accedere e trovare la tua foto sul muro.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── stili condivisi ──────────────────────────────────────────────────────────

const ctaStyle = {
  width: '100%',
  padding: '14px 24px',
  borderRadius: 40,
  background: '#E8A050',
  border: '3px solid rgba(255,255,255,0.85)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  letterSpacing: '0.03em',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const ghostStyle = {
  background: 'none',
  border: 'none',
  color: '#7a5c3a',
  fontFamily: 'sans-serif',
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
}

const labelStyle = {
  display: 'block',
  fontFamily: 'sans-serif',
  fontSize: 12,
  color: '#7a5c3a',
  marginBottom: 6,
  letterSpacing: '0.03em',
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  background: '#2a1205',
  border: '1px solid #5a3a1e',
  borderRadius: 4,
  color: '#f5e6c8',
  outline: 'none',
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
}
