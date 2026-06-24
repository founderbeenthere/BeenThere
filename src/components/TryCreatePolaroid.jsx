import { useState, useEffect, useRef } from 'react'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

// Polaroid proportions (quasi quadrata, leggermente portrait)
// Card: 260px × 325px  → ratio 1:1.25
// Bordi: top/sides 12px, bottom 50px (caption)
// Foto: (260-24)px × (325-62)px = 236px × 263px → ratio 0.90 → leggermente più alta che larga ✅
const CARD_W   = 260
const CARD_H   = 325
const FRAME    = 12
const CAP_H    = 50  // bordo inferiore più alto

const CATEGORIES = ['✈️ Viaggio', '🏔️ Natura', '🏛️ Monumento', '🌅 Panorama', '🍝 Cibo', '🎭 Arte', '🏖️ Mare', '❄️ Montagna']

export default function TryCreatePolaroid({ photoSrc, onBack, onConfirm }) {
  const [placeName,   setPlaceName]   = useState('')
  const [visitDate,   setVisitDate]   = useState('')
  const [category,    setCategory]    = useState('')
  const [geo,         setGeo]         = useState(null)   // { lat, lng, display }
  const [geoState,    setGeoState]    = useState('idle') // idle|loading|found|notfound
  const [suggestions, setSuggestions] = useState([])
  const [showSugg,    setShowSugg]    = useState(false)
  const debounceRef = useRef(null)

  // ── Nominatim geocoding (debounced) ────────────────────────────────────────
  useEffect(() => {
    const q = placeName.trim()
    if (!q) { setGeo(null); setGeoState('idle'); setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    setGeoState('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=4`,
          { headers: { 'Accept-Language': 'it,en' } },
        )
        const data = await res.json()
        if (data.length > 0) {
          setSuggestions(data)
          setShowSugg(true)
          setGeo({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name })
          setGeoState('found')
        } else {
          setSuggestions([])
          setGeo(null)
          setGeoState('notfound')
        }
      } catch {
        setGeoState('notfound')
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [placeName])

  function selectSuggestion(item) {
    setPlaceName(item.display_name.split(',')[0].trim())
    setGeo({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), display: item.display_name })
    setGeoState('found')
    setSuggestions([])
    setShowSugg(false)
  }

  function handleConfirm() {
    const result = {
      place_name: placeName.trim() || 'Il mio posto',
      lat:        geo?.lat ?? null,
      lng:        geo?.lng ?? null,
      visit_date: visitDate || null,
      category,
      photo_src:  photoSrc,
    }
    console.log('polaroid confirmed', result)
    onConfirm(result)
  }

  const canConfirm = placeName.trim().length > 0

  // Foto caption: troncata se lunga
  const captionText = placeName.trim() || 'Il tuo posto'

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowX: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        width: '100%', maxWidth: 480,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="Indietro" style={iconBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 19 }}>📌</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700 }}>
            <span style={{ color: DARK }}>Been</span><span style={{ color: AMBER }}>There</span>
          </span>
        </div>
        <div style={{ width: 32 }} /> {/* spacer */}
      </header>

      {/* ── STEP INDICATOR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px' }}>
        {/* Step 1: foto ✓ */}
        <div style={{ ...stepDot, background: AMBER }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{ width: 24, height: 1, background: AMBER }} />
        {/* Step 2: polaroid (attivo) */}
        <div style={{ ...stepDot, background: AMBER, width: 20, height: 20 }}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'sans-serif' }}>2</span>
        </div>
        <div style={{ width: 24, height: 1, background: '#d4c4b0' }} />
        {/* Step 3: wall (futuro) */}
        <div style={{ ...stepDot, background: '#d4c4b0' }}>
          <span style={{ color: '#9a7a58', fontSize: 9, fontWeight: 700, fontFamily: 'sans-serif' }}>3</span>
        </div>
      </div>

      {/* ── TITOLO ── */}
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: DARK, margin: 0 }}>
          Crea la tua Polaroid
        </h1>
        <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB, margin: '6px 0 0', lineHeight: 1.4 }}>
          Regola il luogo e seleziona le informazioni.
        </p>
      </div>

      {/* ── POLAROID PREVIEW ── */}
      <div style={{
        width: CARD_W, height: CARD_H,
        background: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: `${FRAME}px ${FRAME}px 0`,
        transform: 'rotate(-1.5deg)',
        flexShrink: 0,
        marginBottom: 20,
      }}>
        {/* Foto */}
        <div style={{
          width: '100%',
          height: CARD_H - FRAME - CAP_H,
          overflow: 'hidden',
          background: '#e8ddd0',
        }}>
          {photoSrc ? (
            <img
              src={photoSrc}
              alt="anteprima"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32 }}>📷</span>
            </div>
          )}
        </div>
        {/* Caption — bordo inferiore più alto */}
        <div style={{
          height: CAP_H,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 10px',
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 16, color: DARK,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: CARD_W - 24,
          }}>
            {captionText}
          </span>
        </div>
      </div>

      {/* ── FORM ── */}
      <div style={{ width: '100%', maxWidth: 480, padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Luogo */}
        <div style={{ position: 'relative' }}>
          <label style={labelStyle}>Luogo</label>
          <input
            type="text"
            placeholder="es. Santorini, Grecia"
            value={placeName}
            onChange={e => { setPlaceName(e.target.value); setShowSugg(true) }}
            onBlur={() => setTimeout(() => setShowSugg(false), 180)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            autoFocus
            style={{
              ...inputStyle,
              borderColor: geoState === 'found' ? '#7a9a5a' : geoState === 'notfound' ? '#c07050' : '#d4c4b0',
            }}
          />
          {/* Autocomplete */}
          {showSugg && suggestions.length > 0 && (
            <ul style={suggListStyle}>
              {suggestions.map((item, i) => (
                <li
                  key={i}
                  onMouseDown={() => selectSuggestion(item)}
                  style={suggItemStyle}
                >
                  📍 {item.display_name}
                </li>
              ))}
            </ul>
          )}
          {/* Geo feedback */}
          {geoState === 'loading' && (
            <p style={hintStyle}>Ricerca…</p>
          )}
          {geoState === 'found' && geo && (
            <p style={{ ...hintStyle, color: '#5a7a3a' }}>
              ✓ {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
            </p>
          )}
          {geoState === 'notfound' && placeName.trim() && (
            <p style={{ ...hintStyle, color: '#c07050' }}>Luogo non trovato — verrà posizionato manualmente</p>
          )}
        </div>

        {/* Data */}
        <div>
          <label style={labelStyle}>Data del ricordo</label>
          <input
            type="date"
            value={visitDate}
            onChange={e => setVisitDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Occasione */}
        <div>
          <label style={labelStyle}>Occasione</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat === category ? '' : cat)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 20,
                  border: `1.5px solid ${cat === category ? AMBER : '#d4c4b0'}`,
                  background: cat === category ? AMBER : '#fff',
                  color: cat === category ? '#fff' : SUB,
                  fontFamily: 'sans-serif', fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── CTA FISSA IN BASSO ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: BG, padding: '12px 20px 24px',
        borderTop: '1px solid #e0d5c5',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              width: '100%', padding: '16px',
              background: canConfirm ? AMBER : '#d4c4b0',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 16, fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              letterSpacing: '0.02em',
              transition: 'background 0.2s',
            }}
          >
            Conferma Polaroid
          </button>
        </div>
      </div>

    </div>
  )
}

// ── stili condivisi ───────────────────────────────────────────────────────────
const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
}

const stepDot = {
  width: 16, height: 16, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const labelStyle = {
  display: 'block', fontFamily: 'sans-serif',
  fontSize: 12, fontWeight: 600, color: SUB,
  marginBottom: 6, letterSpacing: '0.03em',
}

const inputStyle = {
  width: '100%', padding: '12px 14px', fontSize: 14,
  background: '#fff', border: '1.5px solid #d4c4b0',
  borderRadius: 10, color: DARK, outline: 'none',
  fontFamily: 'sans-serif', boxSizing: 'border-box',
}

const hintStyle = {
  fontFamily: 'sans-serif', fontSize: 11,
  color: '#9a7a58', margin: '4px 0 0',
}

const suggListStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
  background: '#fff', border: '1px solid #d4c4b0',
  borderTop: 'none', borderRadius: '0 0 8px 8px',
  listStyle: 'none', margin: 0, padding: 0,
  maxHeight: 160, overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}

const suggItemStyle = {
  padding: '10px 14px', fontSize: 12, color: DARK,
  cursor: 'pointer', borderBottom: '1px solid #f0e8d8',
  fontFamily: 'sans-serif', lineHeight: 1.4,
}
