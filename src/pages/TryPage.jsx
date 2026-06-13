import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

// ── SVG icons ────────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)
const IconPin = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconMap = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)
const IconShare = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const IconPrint = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
)
const IconMonitor = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconArrowDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
)
const IconCamera = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

// ── step badge ─────────────────────────────────────────────────────────────────
function Badge({ label }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: AMBER, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, fontFamily: 'sans-serif',
      flexShrink: 0,
    }}>{label}</div>
  )
}

// ── step card ──────────────────────────────────────────────────────────────────
function Step({ badge, badgeAlign = 'left', icon, title, description }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
      {badge && (
        <div style={{ position: 'absolute', top: 0, [badgeAlign]: 0 }}>
          <Badge label={badge} />
        </div>
      )}
      <div style={{ marginTop: badge ? 4 : 0 }}>{icon}</div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: DARK, textAlign: 'center', fontFamily: 'sans-serif' }}>{title}</p>
      <p style={{ margin: 0, fontSize: 11, color: SUB, textAlign: 'center', lineHeight: 1.5, fontFamily: 'sans-serif' }}>{description}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TryPage() {
  const { user, signInWithEmail } = useAuth()

  const [step,        setStep]        = useState('hero')
  const [photoSrc,    setPhotoSrc]    = useState(null)
  const [placeName,   setPlaceName]   = useState('')
  const [email,       setEmail]       = useState('')
  const [sendingLink, setSendingLink] = useState(false)
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhotoSrc(ev.target.result); setStep('preview') }
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSendingLink(true)
    await signInWithEmail(email.trim())
    setSendingLink(false)
    setStep('sent')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        width: '100%', maxWidth: 480,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>📌</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, letterSpacing: '0.01em' }}>
            <span style={{ color: DARK }}>BEEN</span>
            <span style={{ color: AMBER }}>THERE</span>
          </span>
        </div>
        {/* Hamburger — decorativo, no menu */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* ── STEP: HERO ─────────────────────────────────────────────────────── */}
      {step === 'hero' && (
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Headline */}
          <div style={{ padding: '8px 24px 20px', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38, fontWeight: 900,
              margin: 0, lineHeight: 1.15, color: DARK,
            }}>
              Your travel.<br />
              Your map.<br />
              <span style={{ color: AMBER }}>Your wall.</span>
            </h1>
            <p style={{
              fontFamily: 'sans-serif', fontSize: 15,
              color: SUB, marginTop: 12, lineHeight: 1.5,
            }}>
              Trasforma le tue foto<br />in una mappa dei tuoi ricordi.
            </p>
          </div>

          {/* Hero map image */}
          <img
            src="/assets/map-hero.png.png"
            alt="BeenThere world map"
            style={{ width: '100%', display: 'block' }}
          />

          {/* CTA + note */}
          <div style={{ padding: '24px 20px 12px' }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', padding: '18px 24px',
                borderRadius: 12,
                background: AMBER, border: 'none',
                color: '#fff', fontSize: 18, fontWeight: 700,
                fontFamily: "'Playfair Display', serif",
                cursor: 'pointer', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              <IconCamera />
              Carica o scatta una foto
            </button>

            {/* "Nessuna registrazione" */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <IconLock />
              <span style={{ fontFamily: 'sans-serif', fontSize: 13, color: SUB }}>
                Nessuna registrazione richiesta. <strong>Prova subito.</strong>
              </span>
            </div>
          </div>

          {/* ── "Come funziona" ─────────────────────────────────────────────── */}
          <div style={{ padding: '32px 20px 48px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: DARK, textAlign: 'center', margin: '0 0 28px',
            }}>
              Come funziona
            </h2>

            {/* Steps 1 → 2 → 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <Step
                badge="1"
                badgeAlign="left"
                icon={<IconUpload />}
                title="Carica una foto"
                description="Scegli una foto dal tuo dispositivo o scattane una."
              />
              <div style={{ paddingTop: 36, flexShrink: 0 }}><IconArrowRight /></div>
              <Step
                icon={<IconPin />}
                title="Troviamo il luogo"
                description="Rileviamo automaticamente dove è stata scattata."
              />
              <div style={{ paddingTop: 36, flexShrink: 0 }}><IconArrowRight /></div>
              <Step
                badge="3"
                badgeAlign="right"
                icon={<IconMap />}
                title="Creiamo il tuo wall"
                description={"La tua foto prende vita sulla mappa. In modo privato e sicuro."}
              />
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <IconArrowDown />
            </div>

            {/* Outcomes A, B, C */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <Step
                badge="A."
                badgeAlign="left"
                icon={<IconShare />}
                title="Condividi sui Social"
                description="Mostra al mondo i tuoi viaggi."
              />
              <div style={{ width: 20, flexShrink: 0 }} />
              <Step
                badge="B."
                badgeAlign="left"
                icon={<IconPrint />}
                title="Stampa il tuo wall"
                description="Trasforma i tuoi ricordi in un poster unico."
              />
              <div style={{ width: 20, flexShrink: 0 }} />
              <Step
                badge="C."
                badgeAlign="left"
                icon={<IconMonitor />}
                title="Scarica wallpaper"
                description={"screensaver per PC, Smart TV e Mac."}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: PREVIEW ──────────────────────────────────────────────────── */}
      {step === 'preview' && photoSrc && (
        <div style={{ width: '100%', maxWidth: 480, padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {/* Polaroid */}
          <div style={{
            width: 220, background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            padding: '6px 6px 0', transform: 'rotate(-2deg)',
          }}>
            <div style={{ width: '100%', height: 175, overflow: 'hidden' }}>
              <img src={photoSrc} alt="anteprima" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 196 }}>
                {placeName || 'Il tuo posto'}
              </span>
            </div>
          </div>

          {/* Campo luogo */}
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
        </div>
      )}

      {/* ── STEP: SAVE ─────────────────────────────────────────────────────── */}
      {step === 'save' && (
        <div style={{ width: '100%', maxWidth: 480, padding: '40px 24px 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Polaroid ridotta */}
          <div style={{ width: 110, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: '3px 3px 0', transform: 'rotate(-2deg)' }}>
            <div style={{ width: '100%', height: 88, overflow: 'hidden' }}>
              <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: DARK }}>{placeName || 'Il tuo posto'}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", color: DARK, fontSize: 22, margin: '0 0 8px', fontWeight: 700 }}>Bella foto!</p>
            <p style={{ fontFamily: 'sans-serif', color: SUB, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Inserisci la tua email per salvare il viaggio<br />sul tuo muro personale.<br />
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
            <button type="submit" disabled={sendingLink} style={{ ...ctaStyle, opacity: sendingLink ? 0.7 : 1 }}>
              {sendingLink ? 'Invio…' : 'Mandami il link ✉️'}
            </button>
          </form>

          {user && (
            <p style={{ fontFamily: 'sans-serif', color: '#5a7a3a', fontSize: 13, textAlign: 'center' }}>
              Sei già loggato come {user.email}.<br />
              <a href="/" style={{ color: AMBER, textDecoration: 'none', fontWeight: 600 }}>Vai al tuo muro →</a>
            </p>
          )}
        </div>
      )}

      {/* ── STEP: SENT ─────────────────────────────────────────────────────── */}
      {step === 'sent' && (
        <div style={{ width: '100%', maxWidth: 480, padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>✉️</div>
          <p style={{ fontFamily: "'Playfair Display', serif", color: DARK, fontSize: 24, margin: 0, fontWeight: 700 }}>
            Controlla la tua email
          </p>
          <p style={{ fontFamily: 'sans-serif', color: SUB, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Ti abbiamo inviato un link a<br />
            <strong style={{ color: DARK }}>{email}</strong>.<br />
            Cliccalo per accedere e trovare<br />la tua foto sul muro.
          </p>
        </div>
      )}

    </div>
  )
}

// ── stili condivisi ───────────────────────────────────────────────────────────
const ctaStyle = {
  width: '100%', padding: '16px 24px', borderRadius: 12,
  background: AMBER, border: 'none',
  color: '#fff', fontSize: 16, fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  cursor: 'pointer', letterSpacing: '0.02em',
}

const ghostStyle = {
  background: 'none', border: 'none',
  color: SUB, fontFamily: 'sans-serif', fontSize: 13,
  cursor: 'pointer', textDecoration: 'underline', padding: 0,
}

const labelStyle = {
  display: 'block', fontFamily: 'sans-serif',
  fontSize: 12, color: SUB, marginBottom: 6, letterSpacing: '0.03em',
}

const inputStyle = {
  width: '100%', padding: '12px 14px', fontSize: 14,
  background: '#fff', border: `1px solid #c8b898`,
  borderRadius: 6, color: DARK, outline: 'none',
  fontFamily: 'sans-serif', boxSizing: 'border-box',
}
