import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getGuestCount, addGuestTrip } from '../hooks/useGuestTrips'
import TryChoosePhoto    from '../components/TryChoosePhoto'
import TryCreatePolaroid from '../components/TryCreatePolaroid'
import WowMoment         from '../components/WowMoment'
import BeenThereLogo     from '../components/BeenThereLogo'

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
      width: 22, height: 22, borderRadius: '50%',
      background: AMBER, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif',
      flexShrink: 0,
    }}>{label}</div>
  )
}

// ── step card — icona in container ambra, badge assoluto in angolo ─────────────
function Step({ badge, badgeAlign = 'left', icon, title, description }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative' }}>
      {badge && (
        <div style={{ position: 'absolute', top: 0, [badgeAlign]: 0, zIndex: 1 }}>
          <Badge label={badge} />
        </div>
      )}
      {/* Icona in contenitore ambra — tutti i step allo stesso livello */}
      <div style={{
        width: 50, height: 50, borderRadius: 13,
        background: 'rgba(196,120,32,0.09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ transform: 'scale(0.72)', transformOrigin: 'center', display: 'flex' }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: DARK, textAlign: 'center', fontFamily: "'Playfair Display', serif" }}>{title}</p>
      <p style={{ margin: 0, fontSize: 10, color: SUB, textAlign: 'center', lineHeight: 1.4, fontFamily: 'sans-serif' }}>{description}</p>
    </div>
  )
}

// Polaroid decorative sull'hero di /try — posizioni calibrate su map-hero.png (16:9)
// src: foto reale Unsplash — emoji: fallback se la rete non è disponibile
const HERO_POLAROIDS = [
  { id:'usa',       left:'13%', top:'33%', rot:-2.5,
    src:'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=200&q=75',
    emoji:'🗽', caption:'New York'  },
  { id:'europe',    left:'48%', top:'16%', rot: 2,
    src:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200&q=75',
    emoji:'🗼', caption:'Paris'     },
  { id:'pisa',      left:'52%', top:'22%', rot:-1.5,
    src:'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=200&q=75',
    emoji:'🏛️', caption:'Pisa'      },
  { id:'india',     left:'72%', top:'33%', rot: 3,
    src:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200&q=75',
    emoji:'🕌', caption:'India'     },
  { id:'australia', left:'83%', top:'67%', rot:-2,
    src:'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=200&q=75',
    emoji:'🦘', caption:'Sydney'    },
]

function DecorativePolaroid({ left, top, rot, src, emoji, caption }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div style={{
      position: 'absolute', left, top,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      width: 78, zIndex: 10, pointerEvents: 'none',
    }}>
      {/* Pin dorata */}
      <div style={{
        position: 'absolute', top: -10, left: '50%',
        transform: 'translateX(-50%)',
        width: 11, height: 11, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #f5cc50, #C47820)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.40)',
        zIndex: 2,
      }}/>
      {/* Cornice polaroid */}
      <div style={{ background: '#fff', padding: '5px 5px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
        <div style={{ width: '100%', height: 62, overflow: 'hidden', background: '#d8d0c8' }}>
          {src && !imgErr ? (
            <img
              src={src}
              alt={caption}
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {emoji}
            </div>
          )}
        </div>
        <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 11, color: '#1a120a', whiteSpace: 'nowrap' }}>
            {caption}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Comprime un dataURL via Canvas (max 800px, JPEG 0.8)
async function compressDataURL(dataURL, maxDim = 800, quality = 0.8) {
  try {
    const img = new Image()
    img.src = dataURL
    await new Promise(resolve => { img.onload = resolve })
    let { width, height } = img
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height)
      width  = Math.round(width  * ratio)
      height = Math.round(height * ratio)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return dataURL // fallback: usa dataURL originale
  }
}

export default function TryPage() {
  const { user, signInWithEmail } = useAuth()
  const navigate = useNavigate()

  const [step,        setStep]        = useState('hero')
  const [photoSrc,    setPhotoSrc]    = useState(null)
  const [tripData,    setTripData]    = useState(null)
  const [placeName,   setPlaceName]   = useState('')
  const [email,       setEmail]       = useState('')
  const [sendingLink, setSendingLink] = useState(false)
  const fileRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhotoSrc(ev.target.result); setStep('polaroid') }
    reader.readAsDataURL(file)
  }

  async function handleConfirmPolaroid(data) {
    // 1. Comprimi foto (max 800px, JPEG 0.8)
    const compressedSrc = await compressDataURL(data.photo_src)

    // 2. Costruisci trip object
    const trip = {
      id:         `guest-${Date.now()}`,
      place_name: data.place_name,
      lat:        data.lat,
      lng:        data.lng,
      visit_date: data.visit_date || null,
      category:   data.category  || null,
      photo_src:  compressedSrc,
      emoji:      '📍',
      created_at: new Date().toISOString(),
    }

    // 3. Salva in localStorage
    const result = addGuestTrip(trip)
    if (!result.ok) console.warn('Guest limit raggiunto — trip non salvato')

    // 4. Avvia WOW
    setTripData(trip)
    setStep('wow')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSendingLink(true)
    await signInWithEmail(email.trim())
    setSendingLink(false)
    setStep('sent')
  }

  // Step 'wow' — animazione WOW + redirect automatico al wall
  if (step === 'wow') {
    return (
      <WowMoment
        trip={tripData}
        onDone={() => navigate('/', { state: { celebrate: true, tripId: tripData?.id } })}
      />
    )
  }

  // Step 'polaroid' — schermata propria con header interno
  if (step === 'polaroid') {
    return (
      <TryCreatePolaroid
        photoSrc={photoSrc}
        onBack={() => setStep('choose')}
        onConfirm={handleConfirmPolaroid}
      />
    )
  }

  // ── HERO — immagine statica approvata + click target trasparente sul CTA ────
  // L'immagine try-landing-static.png include già logo, headline, mappa,
  // CTA, "Nessuna registrazione", "Come funziona" e A/B/C.
  // NON mostriamo l'header di TryPage per evitare duplicazioni.
  if (step === 'hero') {
    return (
      <div style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position: 'relative', width: '100%', background: '#f0ebe0' }}>
        <img
          src="/assets/try-landing-final.png"
          alt="BeenThere — Your travel. Your map. Your wall."
          style={{ width: '100%', display: 'block' }}
          draggable={false}
        />
        {/* Click target trasparente sul bottone "Carica o scatta una foto".
            Il CTA nell'immagine 9:19.5 è posizionato tra il 59% e il 67% dall'alto. */}
        <button
          onClick={() => setStep('choose')}
          aria-label="Carica o scatta una foto"
          style={{
            position: 'absolute',
            top:    '59%',
            height: '7.5%',
            left:   '7%',
            right:  '7%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            borderRadius: 12,
          }}
        />
      </div>
      </div>
    )
  }

  // Step 'choose' — schermata propria con header interno
  if (step === 'choose') {
    return (
      <TryChoosePhoto
        guestCount={getGuestCount()}
        onBack={() => setStep('hero')}
        onPhotoSelected={handleFile}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        width: '100%', maxWidth: 480,
        padding: '6px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo ufficiale BeenThere! */}
        <BeenThereLogo size={18}/>
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
          <div style={{ padding: '2px 24px 4px', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 35, fontWeight: 900,
              margin: 0, lineHeight: 1.04, color: DARK,
            }}>
              Your travel.<br />
              Your map.<br />
              <span style={{ color: AMBER }}>Your wall.</span>
            </h1>
            <p style={{
              fontFamily: 'sans-serif', fontSize: 14,
              color: SUB, marginTop: 5, lineHeight: 1.4,
            }}>
              Trasforma le tue foto<br />in una mappa dei tuoi ricordi.
            </p>
          </div>

          {/* Hero — mappa legno + 5 polaroid decorative (Opzione C approvata) */}
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src="/assets/map-hero.png"
              alt="BeenThere world map"
              style={{ width: '100%', display: 'block', maxHeight: '44vw', objectFit: 'cover', objectPosition: 'center top' }}
            />
            {HERO_POLAROIDS.map(p => (
              <DecorativePolaroid key={p.id} {...p}/>
            ))}
          </div>

          {/* CTA + note */}
          <div style={{ padding: '10px 20px 6px' }}>
            <button
              onClick={() => setStep('choose')}
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
          <div style={{ padding: '10px 16px 24px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: DARK, textAlign: 'center', margin: '0 0 12px',
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
              <div style={{ paddingTop: 20, flexShrink: 0 }}><IconArrowRight /></div>
              <Step
                icon={<IconPin />}
                title="Troviamo il luogo"
                description="Rileviamo automaticamente dove è stata scattata."
              />
              <div style={{ paddingTop: 20, flexShrink: 0 }}><IconArrowRight /></div>
              <Step
                badge="3"
                badgeAlign="right"
                icon={<IconMap />}
                title="Creiamo il tuo wall"
                description={"La tua foto prende vita sulla mappa. In modo privato e sicuro."}
              />
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
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
