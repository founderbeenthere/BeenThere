import { useRef } from 'react'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

export default function TryChoosePhoto({ onBack, onPhotoSelected, guestCount }) {
  const cameraRef  = useRef(null)
  const galleryRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onPhotoSelected(file)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', overflowX: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        width: '100%', maxWidth: 480,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          aria-label="Indietro"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: AMBER }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Logo centrato */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>📌</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700 }}>
            <span style={{ color: DARK }}>Been</span>
            <span style={{ color: AMBER }}>There</span>
          </span>
        </div>

        {/* Info placeholder */}
        <button aria-label="Info" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>
      </header>

      {/* ── GUEST COUNTER ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '0 20px 8px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontFamily: 'sans-serif', fontSize: 13, color: SUB }}>
              Guest
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Progress bar */}
            <div style={{ width: 80, height: 4, background: '#e8ddd0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${(guestCount / 3) * 100}%`,
                height: '100%', background: AMBER, borderRadius: 2,
                transition: 'width 0.3s ease',
              }}/>
            </div>
            <span style={{ fontFamily: 'sans-serif', fontSize: 13, color: DARK, fontWeight: 600 }}>
              {guestCount} / 3 ricordi
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── TITLE ── */}
      <div style={{ width: '100%', maxWidth: 480, padding: '20px 20px 12px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 800, color: DARK, margin: '0 0 8px',
        }}>
          Scegli la tua foto
        </h1>
        <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: SUB, margin: 0, lineHeight: 1.5 }}>
          Carica o scatta una foto.<br />
          Trasformeremo il tuo ricordo in un punto del tuo wall.
        </p>
      </div>

      {/* ── FOTO RECENTI (placeholder web) ── */}
      <div style={{ width: '100%', maxWidth: 480, padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600, color: DARK }}>Foto recenti</span>
          <button
            onClick={() => galleryRef.current?.click()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
          >
            <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: AMBER, fontWeight: 600 }}>Mostra tutto</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Grid 3 colonne — placeholder per web */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <button
              key={i}
              onClick={() => galleryRef.current?.click()}
              style={{
                aspectRatio: '1/1',
                background: i === 0 ? '#e0d5c5' : `hsl(${30 + i * 4}, ${20 + i % 3 * 5}%, ${78 - i % 4 * 3}%)`,
                border: 'none', cursor: 'pointer', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {i === 0 && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a8060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── PULSANTI AZIONE ── */}
      <div style={{ width: '100%', maxWidth: 480, padding: '0 20px', marginTop: 'auto' }}>

        {/* Scatta una foto */}
        <button
          onClick={() => cameraRef.current?.click()}
          style={{
            width: '100%', padding: '16px 20px',
            background: AMBER, border: 'none', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', marginBottom: 10,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Scatta una foto
            </div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
              Apri la fotocamera
            </div>
          </div>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 10px' }}>
          <div style={{ flex: 1, height: 1, background: '#d4c4b0' }}/>
          <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB }}>oppure</span>
          <div style={{ flex: 1, height: 1, background: '#d4c4b0' }}/>
        </div>

        {/* Sfoglia la galleria */}
        <button
          onClick={() => galleryRef.current?.click()}
          style={{
            width: '100%', padding: '14px 16px',
            background: '#fff', border: `1.5px solid #d4c4b0`, borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600, color: DARK }}>
              Sfoglia la galleria
            </div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: SUB, marginTop: 2, lineHeight: 1.4 }}>
              Seleziona una o più foto. Ordina in base alla preferenza.
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Footer privacy */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '16px 0 24px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB }}>
            Le tue foto sono private e al sicuro.
          </span>
        </div>
      </div>

      {/* ── INPUT NASCOSTI ── */}
      {/* capture="environment" → fotocamera su mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {/* Nessun capture → file picker / galleria */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
