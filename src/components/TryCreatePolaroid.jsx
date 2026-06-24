import { useState, useEffect, useRef } from 'react'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

const PHOTO_RATIO = {
  vertical:   '216 / 248',
  horizontal: '272 / 248',
}
const FRAME = 8
const CAP_H = 32

const CATEGORIES = [
  'Viaggio','Natura','Mare','Montagna','Città',
  'Monumenti','Cultura','Arte','Cibo','Eventi',
  'Persone','Sport','Altro',
]

function GridOverlay() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <line x1="33.3" y1="0"    x2="33.3" y2="100"  stroke="rgba(255,255,255,0.16)" strokeWidth="0.5"/>
      <line x1="66.6" y1="0"    x2="66.6" y2="100"  stroke="rgba(255,255,255,0.16)" strokeWidth="0.5"/>
      <line x1="0"    y1="33.3" x2="100"  y2="33.3" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5"/>
      <line x1="0"    y1="66.6" x2="100"  y2="66.6" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5"/>
    </svg>
  )
}

function OrientThumb({ id, active, onClick }) {
  const c = active ? '#fff' : AMBER
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, height: 42,
      background: active ? AMBER : 'transparent',
      border: `1px solid ${active ? AMBER : 'rgba(196,170,132,0.5)'}`,
      borderRadius: 10, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
      transition: 'all 0.15s',
    }}>
      {id === 'vertical'
        ? <div style={{ width: 11, height: 16, border: `1.5px solid ${c}`, borderRadius: 2 }}/>
        : <div style={{ width: 16, height: 11, border: `1.5px solid ${c}`, borderRadius: 2 }}/>
      }
      <span style={{ fontFamily:'sans-serif', fontSize:9, fontWeight:600, color: active ? '#fff' : SUB, letterSpacing:'0.02em' }}>
        {id === 'vertical' ? 'Verticale' : 'Orizzontale'}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TryCreatePolaroid({ photoSrc, onBack, onConfirm }) {
  const [orientation, setOrientation] = useState('vertical')
  const [placeName,   setPlaceName]   = useState('')
  const [visitDate,   setVisitDate]   = useState('')
  const [category,    setCategory]    = useState('')
  const [geo,         setGeo]         = useState(null)
  const [geoState,    setGeoState]    = useState('idle')
  const [suggestions, setSuggestions] = useState([])
  const [showSugg,    setShowSugg]    = useState(false)
  const debounceRef = useRef(null)

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
          setSuggestions(data); setShowSugg(true)
          setGeo({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
          setGeoState('found')
        } else { setSuggestions([]); setGeo(null); setGeoState('notfound') }
      } catch { setGeoState('notfound') }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [placeName])

  function selectSuggestion(item) {
    setPlaceName(item.display_name.split(',')[0].trim())
    setGeo({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
    setGeoState('found'); setSuggestions([]); setShowSugg(false)
  }

  function handleConfirm() {
    onConfirm({
      place_name: placeName.trim() || 'Il mio posto',
      lat: geo?.lat ?? null, lng: geo?.lng ?? null,
      visit_date: visitDate || null,
      category: category || null,
      orientation, photo_src: photoSrc,
    })
  }

  const canConfirm  = placeName.trim().length > 0
  const captionText = placeName.trim() || 'Il tuo posto'

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:BG, display:'flex', flexDirection:'column', overflowX:'hidden', boxSizing:'border-box' }}>

      {/* ── HEADER — ← | BeenThere centrato | ⓘ ── */}
      <header style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', flexShrink:0 }}>
        <button onClick={onBack} aria-label="Indietro" style={{ background:'none', border:'none', cursor:'pointer', padding:4, zIndex:1 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        {/* Logo centrato in assoluto */}
        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:5, pointerEvents:'none' }}>
          <span style={{ fontSize:17 }}>📌</span>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700 }}>
            <span style={{ color:DARK }}>Been</span><span style={{ color:AMBER }}>There</span>
          </span>
        </div>
        {/* Info icon */}
        <button aria-label="Info" style={{ background:'none', border:'none', cursor:'pointer', padding:4, zIndex:1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>
      </header>

      {/* ── STEP INDICATOR — 4 step come mockup ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'2px 0 10px' }}>
        {[1,2,3,4].map(n => (
          <div key={n} style={{
            height: 7,
            width:  n === 2 ? 22 : 7,
            borderRadius: 4,
            background: n <= 2 ? AMBER : '#d4c4b0',
            transition: 'all 0.2s',
          }}/>
        ))}
      </div>

      {/* ── TITOLO + SOTTOTITOLO ── */}
      <div style={{ padding:'0 16px 12px', maxWidth:480, margin:'0 auto', width:'100%' }}>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:21, fontWeight:800, color:DARK, margin:'0 0 3px' }}>
          Crea la tua Polaroid
        </h1>
        <p style={{ fontFamily:'sans-serif', fontSize:11, color:SUB, margin:0, lineHeight:1.4 }}>
          Regola l'inquadratura e conferma le informazioni.
        </p>
      </div>

      {/* ── CORPO — 3 righe con allineamento verticale preciso ── */}
      {/*
        RIGA A: [spazio sx]          | [bottoni Verticale/Orizzontale]
        RIGA B: [card Luogo/Data/Cat]| [CROP grande]
        RIGA C: [box Rilevato auto]  | [preview polaroid emozionale]
      */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'0 16px 88px', maxWidth:480, margin:'0 auto', width:'100%', flex:1 }}>

        {/* ── RIGA A — bottoni orientazione allineati sul crop ── */}
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ flex:'0 0 44%' }}/>{/* spacer = larghezza colonna sinistra */}
          <div style={{ display:'flex', gap:6, maxWidth:'85%' }}>
            <OrientThumb id="vertical"   active={orientation==='vertical'}   onClick={() => setOrientation('vertical')}/>
            <OrientThumb id="horizontal" active={orientation==='horizontal'} onClick={() => setOrientation('horizontal')}/>
          </div>
        </div>

        {/* ── RIGA B — form card | crop grande ── */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>

          {/* Sinistra: card Luogo / Data / Categoria */}
          <div style={{ flex:'0 0 44%' }}>
            <div style={{
              background:'#fff',
              borderRadius:12,
              border:'1px solid rgba(196,170,132,0.22)',
              boxShadow:'0 1px 8px rgba(196,170,132,0.14)',
              overflow:'hidden',
            }}>
              {/* Luogo */}
              <div style={{ padding:'10px 12px', borderBottom:'1px solid #f0e8d8' }}>
                <label style={labelStyle}>Luogo</label>
                <input
                  type="text" placeholder="es. Pisa, Italia"
                  value={placeName}
                  onChange={e => { setPlaceName(e.target.value); setShowSugg(true) }}
                  onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                  autoFocus
                  style={{ ...inputStyle, borderColor: geoState==='found' ? '#7a9a5a' : geoState==='notfound' ? '#c07050' : '#e8ddd0' }}
                />
                {showSugg && suggestions.length > 0 && (
                  <ul style={suggListStyle}>
                    {suggestions.map((item,i) => (
                      <li key={i} onMouseDown={() => selectSuggestion(item)} style={suggItemStyle}>
                        {item.display_name.split(',')[0]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Data */}
              <div style={{ padding:'10px 12px', borderBottom:'1px solid #f0e8d8' }}>
                <label style={labelStyle}>Data</label>
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} style={inputStyle}/>
              </div>
              {/* Categoria */}
              <div style={{ padding:'10px 12px' }}>
                <label style={labelStyle}>Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor:'pointer', appearance:'auto' }}>
                  <option value="">Seleziona…</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Destra: CROP con griglia e corner markers */}
          <div style={{ flex:1 }}>
            <div style={{ width:'100%', position:'relative', borderRadius:4, overflow:'hidden' }}>
              <div style={{ width:'100%', aspectRatio:PHOTO_RATIO[orientation], overflow:'hidden', background:'#c8c0b0', position:'relative' }}>
                {photoSrc && <img src={photoSrc} alt="crop" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} draggable={false}/>}
                <GridOverlay/>
                {[
                  { top:5, left:5,  bt:'1.5px solid rgba(255,255,255,0.55)', bl:'1.5px solid rgba(255,255,255,0.55)' },
                  { top:5, right:5, bt:'1.5px solid rgba(255,255,255,0.55)', br:'1.5px solid rgba(255,255,255,0.55)' },
                  { bottom:5, left:5,  bb:'1.5px solid rgba(255,255,255,0.55)', bl:'1.5px solid rgba(255,255,255,0.55)' },
                  { bottom:5, right:5, bb:'1.5px solid rgba(255,255,255,0.55)', br:'1.5px solid rgba(255,255,255,0.55)' },
                ].map((m,i) => (
                  <div key={i} style={{
                    position:'absolute', width:9, height:9, pointerEvents:'none',
                    top:m.top, bottom:m.bottom, left:m.left, right:m.right,
                    borderTop:m.bt, borderBottom:m.bb, borderLeft:m.bl, borderRight:m.br,
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGA C — geo box | preview polaroid ── */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>

          {/* Sinistra: box "Rilevato automaticamente" allineato con la polaroid */}
          <div style={{ flex:'0 0 44%' }}>
            <div style={{
              background: geoState==='found' ? 'rgba(196,120,32,0.07)' : '#f7f3ee',
              border: `1px solid ${geoState==='found' ? 'rgba(196,120,32,0.28)' : '#e8ddd0'}`,
              borderRadius:10, padding:'10px 11px',
            }}>
              {geoState === 'found' && geo ? (
                <>
                  <p style={{ fontFamily:'sans-serif', fontSize:9, fontWeight:700, color:AMBER, margin:'0 0 2px', letterSpacing:'0.03em' }}>
                    ✨ Rilevato automaticamente
                  </p>
                  <p style={{ fontFamily:'sans-serif', fontSize:9, color:SUB, margin:'0 0 4px', lineHeight:1.4, opacity:0.8 }}>
                    Posizionato sul wall in base al luogo.
                  </p>
                  <p style={{ fontFamily:'sans-serif', fontSize:10, fontWeight:600, color:DARK, margin:'0 0 8px' }}>
                    {placeName}
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    <button style={geoBtn}>✓ Conferma</button>
                    <button onClick={() => { setPlaceName(''); setGeo(null); setGeoState('idle') }}
                      style={{ ...geoBtn, background:'transparent', color:SUB, border:'1px solid #d4c4b0', fontSize:8 }}>
                      Modifica manualmente
                    </button>
                  </div>
                </>
              ) : geoState === 'loading' ? (
                <p style={{ fontFamily:'sans-serif', fontSize:10, color:SUB, margin:0 }}>Ricerca posizione…</p>
              ) : geoState === 'notfound' ? (
                <p style={{ fontFamily:'sans-serif', fontSize:10, color:'#c07050', margin:0 }}>
                  Non trovato — posizionato manualmente
                </p>
              ) : (
                <p style={{ fontFamily:'sans-serif', fontSize:9, color:SUB, margin:0, opacity:0.7, lineHeight:1.4 }}>
                  Digita il luogo per la geolocalizzazione automatica
                </p>
              )}
            </div>
          </div>

          {/* Destra: preview polaroid emozionale — avvicinata al crop */}
          <div style={{ flex:1, display:'flex', justifyContent:'center', marginTop:'-26px' }}>
            <div style={{
              width:'76%',
              background:'#fff',
              boxShadow:'0 5px 20px rgba(0,0,0,0.14)',
              padding:`${FRAME}px ${FRAME}px 0`,
              transform:'rotate(-1.5deg)',
            }}>
              <div style={{ width:'100%', aspectRatio:PHOTO_RATIO[orientation], overflow:'hidden', background:'#d8cfc4' }}>
                {photoSrc && <img src={photoSrc} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} draggable={false}/>}
              </div>
              <div style={{ height:CAP_H, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px' }}>
                <span style={{ fontFamily:"'Caveat', cursive", fontSize:12, color:DARK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>
                  {captionText}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CTA FISSA ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:30, background:BG, padding:'10px 16px 22px', borderTop:'1px solid #e0d5c5' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              width:'100%', padding:'15px',
              background: canConfirm ? AMBER : 'rgba(196,120,32,0.18)',
              border: `1px solid ${canConfirm ? AMBER : 'rgba(196,120,32,0.3)'}`,
              borderRadius:12,
              color: canConfirm ? '#fff' : 'rgba(196,120,32,0.55)',
              fontSize:15, fontWeight:700,
              fontFamily:"'Playfair Display', serif",
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              letterSpacing:'0.02em', transition:'all 0.2s',
            }}
          >
            Conferma inquadratura e informazioni
          </button>
        </div>
      </div>

    </div>
  )
}

// ── Stili ─────────────────────────────────────────────────────────────────────
const labelStyle = {
  display:'block', fontFamily:'sans-serif',
  fontSize:10, fontWeight:600, color:SUB,
  marginBottom:4, letterSpacing:'0.03em',
}

const inputStyle = {
  width:'100%', padding:'7px 9px', fontSize:11,
  background:'#f8f5f0', border:'1px solid #e8ddd0',
  borderRadius:7, color:DARK, outline:'none',
  fontFamily:'sans-serif', boxSizing:'border-box',
}

const suggListStyle = {
  background:'#fff', border:'1px solid #d4c4b0',
  borderRadius:6, listStyle:'none',
  margin:'3px 0 0', padding:0,
  maxHeight:110, overflowY:'auto',
  boxShadow:'0 3px 10px rgba(0,0,0,0.08)',
}

const suggItemStyle = {
  padding:'7px 10px', fontSize:10, color:DARK,
  cursor:'pointer', borderBottom:'1px solid #f0e8d8',
  fontFamily:'sans-serif', lineHeight:1.3,
}

const geoBtn = {
  flex:1, padding:'5px 4px',
  background:AMBER, border:'none', borderRadius:6,
  color:'#fff', fontSize:9, fontWeight:600,
  fontFamily:'sans-serif', cursor:'pointer',
}
