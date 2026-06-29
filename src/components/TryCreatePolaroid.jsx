import { useState, useEffect, useRef } from 'react'
import { recognizePhoto } from '../lib/vision'

const AMBER = '#C47820'
const BG    = '#f0ebe0'
const DARK  = '#1a120a'
const SUB   = '#5a4030'

// ── Proporzioni foto polaroid ────────────────────────────────────────────────
// Base = formato verticale (portrait). Il formato orizzontale è la STESSA foto
// ruotata idealmente di 90°: larghezza e altezza si scambiano. Quindi il lato
// lungo dell'orizzontale (LANDSCAPE_PHOTO_W) coincide con l'altezza della
// verticale (PORTRAIT_PHOTO_H). Niente valori "a occhio": tutto derivato da qui.
const PORTRAIT_PHOTO_W  = 216
const PORTRAIT_PHOTO_H  = 248
const LANDSCAPE_PHOTO_W = PORTRAIT_PHOTO_H   // 248 — lato lungo = altezza verticale
const LANDSCAPE_PHOTO_H = PORTRAIT_PHOTO_W   // 216

const PHOTO_RATIO = {
  vertical:   `${PORTRAIT_PHOTO_W} / ${PORTRAIT_PHOTO_H}`,   // 216 / 248 (portrait)
  horizontal: `${LANDSCAPE_PHOTO_W} / ${LANDSCAPE_PHOTO_H}`, // 248 / 216 (landscape)
}

// Cornice polaroid: bordo superiore + laterali sottili, bordo inferiore più
// spesso (ci vanno luogo/data/categoria). Il bordo spesso resta SEMPRE in basso,
// anche in orizzontale — non ruota lateralmente.
const FRAME = 8    // bordo superiore + laterali (sottile)
const CAP_H = 32   // bordo inferiore — fascia caption (più spessa)

const CATEGORIES = [
  'Viaggio','Natura','Mare','Montagna','Città',
  'Monumenti','Cultura','Arte','Cibo','Eventi',
  'Persone','Sport','Altro',
]

// Base del geocoder. Il Nominatim pubblico VIETA l'autocomplete "as-you-type" e
// lo rate-limita per IP → sul device reale i luoghi spesso non vengono trovati.
// Per la beta va sostituito con un provider che permette l'autocomplete (es.
// LocationIQ, compatibile con Nominatim): basta cambiare questa base e aggiungere
// &key=... alle due fetch sotto. I dati/ranking restano gli stessi (OSM).
const GEOCODER_BASE = 'https://nominatim.openstreetmap.org'

// Coordinata valida: presente, finita, NON 0,0 (null island) e dentro i range
// geografici. 0,0 e null vanno trattati come "posizione non trovata".
function isValidCoord(lat, lng) {
  return lat != null && lng != null &&
         Number.isFinite(lat) && Number.isFinite(lng) &&
         !(lat === 0 && lng === 0) &&
         Math.abs(lat) <= 90 && Math.abs(lng) <= 180
}

// Suggerisce una categoria dai campi class/type di Nominatim (geocode).
// SOLO un suggerimento: l'utente può sempre cambiare. "Altro" è l'ultimo
// fallback → ritorna null se non c'è un match sicuro (la categoria resta com'è).
// NB: questo copre il caso in cui un luogo viene risolto (GPS o ricerca testo).
// Il riconoscimento del landmark dalla SOLA foto (vision AI) è separato e non
// implementato in questo sprint (richiede provider + consenso privacy).
function suggestCategoryFrom(item) {
  if (!item) return null
  const cls  = String(item.class || item.category || '').toLowerCase()
  const type = String(item.type  || '').toLowerCase()

  // Monumenti — storico, luoghi di culto, castelli, rovine, memoriali…
  if (cls === 'historic') return 'Monumenti'
  if (['monument','memorial','castle','fort','ruins','archaeological_site','city_gate','tower'].includes(type)) return 'Monumenti'
  if (['place_of_worship','cathedral','church','chapel','mosque','temple','synagogue','shrine'].includes(type)) return 'Monumenti'
  // Cultura / Arte
  if (['museum','gallery','arts_centre','theatre','library','cinema'].includes(type)) return 'Cultura'
  if (type === 'artwork') return 'Arte'
  // Natura / Montagna / Mare
  if (cls === 'natural') {
    if (['peak','volcano','glacier','ridge','cliff','cave_entrance'].includes(type)) return 'Montagna'
    if (['beach','bay','cape','reef','coastline','water','shoal'].includes(type)) return 'Mare'
    return 'Natura'
  }
  if (type === 'beach') return 'Mare'
  if (['mountain_range','massif'].includes(type)) return 'Montagna'
  // Cibo
  if (cls === 'amenity' && ['restaurant','cafe','bar','pub','fast_food','ice_cream','food_court'].includes(type)) return 'Cibo'
  // Sport / tempo libero
  if (cls === 'leisure' || cls === 'sport' || type === 'stadium' || type === 'sports_centre') return 'Sport'
  // Eventi
  if (['theme_park','attraction'].includes(type) && cls === 'tourism') return 'Eventi'
  // Città / centri abitati
  if (cls === 'place' && ['city','town','village','suburb','hamlet','neighbourhood','quarter'].includes(type)) return 'Città'
  // Turismo generico → Cultura (meglio di "Altro")
  if (cls === 'tourism') return 'Cultura'

  return null // nessun match certo → resta com'è ("Altro" come ultimo fallback)
}

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
export default function TryCreatePolaroid({ photoSrc, exifData, onBack, onConfirm }) {
  const [orientation, setOrientation] = useState('vertical')
  const [placeName,   setPlaceName]   = useState('')
  const [visitDate,   setVisitDate]   = useState('')
  const [category,    setCategory]    = useState('Altro') // B: default "Altro" sempre selezionato
  const [geo,         setGeo]         = useState(null)
  const [geoState,    setGeoState]    = useState('idle')
  // sorgente del geo corrente: 'exif' = letto dai metadata foto, 'manual' = scelto
  // dall'utente (ricerca/selezione). Serve solo per il messaggio, non per la logica.
  const [geoSource,   setGeoSource]   = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSugg,    setShowSugg]    = useState(false)
  const debounceRef   = useRef(null)
  const abortRef      = useRef(null)   // annulla la fetch in volo (anti out-of-order + meno rate-limit)
  const placeInputRef = useRef(null)   // per il focus automatico quando il luogo non è trovato
  // skipSearch: quante volte il search-effect deve ignorare il cambio di placeName
  // (usato quando il nome viene impostato automaticamente da EXIF, non dall'utente)
  const skipSearch    = useRef(0)
  // specchio di placeName → la callback Vision asincrona legge il valore CORRENTE
  // (l'utente può aver digitato mentre l'AI era in volo).
  const placeNameRef  = useRef(placeName)
  placeNameRef.current = placeName
  // Priorità sorgente categoria: manuale > vision > geocoding > default.
  // Una sorgente scrive la categoria solo se ha rango ≥ di quella corrente →
  // la scelta MANUALE vince sempre; Vision sta sopra il geocoding.
  const CAT_RANK = { default: 0, geocoding: 1, vision: 2, manual: 3 }
  const categorySource = useRef('default')
  function setCategoryFrom(value, source) {
    if (!value) return
    if (CAT_RANK[source] < CAT_RANK[categorySource.current]) return
    categorySource.current = source
    setCategory(value)
  }
  // Suggerimento da geocoding (class/type Nominatim) — non impone (rango basso).
  function suggestCategory(item) {
    const c = suggestCategoryFrom(item)
    if (c) setCategoryFrom(c, 'geocoding')
  }

  // A: pre-compila Data e Luogo da EXIF GPS
  useEffect(() => {
    if (!exifData) return
    if (exifData.date) setVisitDate(exifData.date)

    if (isValidCoord(exifData.lat, exifData.lng)) {
      const lat4 = exifData.lat.toFixed(4)
      const lng4 = exifData.lng.toFixed(4)
      console.log('REVERSE GEOCODE START', lat4, lng4)

      // Imposta subito geo + coordinate come placeholder → CTA già abilitata
      setGeo({ lat: exifData.lat, lng: exifData.lng })
      setGeoState('found')
      setGeoSource('exif')
      skipSearch.current += 1          // la prossima modifica a placeName viene da qui
      setPlaceName(`${lat4}, ${lng4}`)

      // Reverse geocode in background → sostituisce con nome leggibile
      fetch(
        `${GEOCODER_BASE}/reverse?lat=${exifData.lat}&lon=${exifData.lng}&format=json&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'it,en' } }
      )
        .then(r => r.json())
        .then(data => {
          console.log('REVERSE GEOCODE RESULT', JSON.stringify(data?.address))
          const name =
            data.address?.city    ||
            data.address?.town    ||
            data.address?.village ||
            data.address?.county  ||
            (data.display_name?.split(',')[0] ?? '')
          if (name.trim()) {
            skipSearch.current += 1    // anche questo cambio viene da qui, non dall'utente
            setPlaceName(name.trim())
            setGeo({ lat: exifData.lat, lng: exifData.lng }) // mantieni geo corretto
            setGeoState('found')
            setGeoSource('exif')
            suggestCategory(data)      // suggerisce categoria dal luogo (non impone)
          }
        })
        .catch(e => console.log('REVERSE GEOCODE ERROR', String(e)))
    }
  }, [exifData])

  useEffect(() => {
    const q = placeName.trim()
    if (!q) { setGeo(null); setGeoState('idle'); setGeoSource(null); setSuggestions([]); return }
    // Skip: nome impostato automaticamente da EXIF (non input utente)
    if (skipSearch.current > 0) { skipSearch.current -= 1; return }
    clearTimeout(debounceRef.current)
    setGeoState('loading')
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()                 // annulla la richiesta precedente
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const res  = await fetch(
          `${GEOCODER_BASE}/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`,
          { headers: { 'Accept-Language': 'it,en' }, signal: ctrl.signal },
        )
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data); setShowSugg(true)
          setGeo({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
          setGeoState('found')
          setGeoSource('manual')
          // Per la categoria preferisci il primo risultato che mappa a qualcosa
          // (il landmark) invece di data[0] che a volte è una strada omonima.
          suggestCategory(data.find(it => suggestCategoryFrom(it)) || data[0])
        } else { setSuggestions([]); setGeo(null); setGeoState('notfound'); setGeoSource(null) }
      } catch (e) {
        if (e.name !== 'AbortError') { setGeoState('notfound'); setGeoSource(null) }
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [placeName])

  // #4 — quando il luogo non è trovato, riporta il focus sul campo Luogo così
  // l'utente può correggere subito (non si sente bloccato).
  useEffect(() => {
    if (geoState === 'notfound') placeInputRef.current?.focus()
  }, [geoState])

  // Cleanup su unmount: annulla fetch in volo + debounce → niente setState dopo
  // unmount, niente richieste orfane.
  useEffect(() => () => {
    abortRef.current?.abort()
    clearTimeout(debounceRef.current)
  }, [])

  // ── Vision Layer (Sprint 3C) — chiamata ASINCRONA in background ──────────────
  // L'utente non aspetta mai: nessun blocco UI, nessun popup/toast, nessun errore
  // visibile. null/timeout/errore → non succede assolutamente nulla.
  useEffect(() => {
    if (!photoSrc) return
    const hasGps = isValidCoord(exifData?.lat, exifData?.lng)
    const ctrl = new AbortController()
    // 12s: ≥ timeout server (9s). gemini-2.5-flash su scene complesse supera i 4-5s
    // e la chiamata è in background (l'utente non aspetta), quindi diamo margine.
    const timer = setTimeout(() => ctrl.abort(), 12000)
    recognizePhoto({
      dataURL: photoSrc,
      hasGps,
      context: hasGps ? { lat: exifData.lat, lng: exifData.lng } : null,
      signal: ctrl.signal,
    })
      .then(res => {
        if (!res) return
        // Categoria: pre-compila il selettore solo a confidence alta (decision
        // 'auto'), rispettando la priorità (non sovrascrive la scelta manuale).
        if (res.category?.decision === 'auto' && res.category.value) {
          setCategoryFrom(res.category.value, 'vision')
        }
        // Luogo: SOLO senza GPS, solo se il campo è ancora vuoto (suggerimento
        // removibile). Settare placeName fa partire il geocoding esistente → pin.
        if (!hasGps && res.place?.decision === 'auto' && res.place.name && !placeNameRef.current.trim()) {
          setPlaceName(res.place.name)
        }
      })
      .catch(() => { /* silenzioso */ })
    return () => { clearTimeout(timer); ctrl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoSrc])

  function selectSuggestion(item) {
    setPlaceName(item.display_name.split(',')[0].trim())
    setGeo({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
    setGeoState('found'); setGeoSource('manual'); setSuggestions([]); setShowSugg(false)
    suggestCategory(item)   // suggerisce categoria dalla scelta (non impone)
  }

  const hasValidGeo = isValidCoord(geo?.lat, geo?.lng)

  function handleConfirm() {
    // Mai salvare 0,0 o coordinate invalide: se la posizione non è valida
    // la conferma è bloccata a monte (canConfirm), ma resta il null-guard.
    onConfirm({
      place_name: placeName.trim() || 'Il mio posto',
      lat: hasValidGeo ? geo.lat : null,
      lng: hasValidGeo ? geo.lng : null,
      visit_date: visitDate || null,
      category: category || null,
      orientation, photo_src: photoSrc,
    })
  }

  // Serve una posizione VALIDA per confermare: se non viene trovata, l'utente
  // deve selezionarla manualmente. Non si posiziona mai il ricordo a 0,0.
  const canConfirm  = !!photoSrc && hasValidGeo
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
                  ref={placeInputRef}
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
                <select value={category} onChange={e => setCategoryFrom(e.target.value, 'manual')} style={{ ...inputStyle, cursor:'pointer', appearance:'auto' }}>

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
                    {geoSource === 'exif' ? '✨ Rilevato automaticamente' : '✓ Luogo impostato'}
                  </p>
                  <p style={{ fontFamily:'sans-serif', fontSize:9, color:SUB, margin:'0 0 4px', lineHeight:1.4, opacity:0.8 }}>
                    Posizionato sul wall in base al luogo.
                  </p>
                  <p style={{ fontFamily:'sans-serif', fontSize:10, fontWeight:600, color:DARK, margin:'0 0 8px' }}>
                    {placeName}
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    <button style={geoBtn}>✓ Conferma</button>
                    <button onClick={() => { setPlaceName(''); setGeo(null); setGeoState('idle'); setGeoSource(null) }}
                      style={{ ...geoBtn, background:'transparent', color:SUB, border:'1px solid #d4c4b0', fontSize:8 }}>
                      Modifica manualmente
                    </button>
                  </div>
                </>
              ) : geoState === 'loading' ? (
                <p style={{ fontFamily:'sans-serif', fontSize:10, color:SUB, margin:0 }}>Ricerca posizione…</p>
              ) : geoState === 'notfound' ? (
                <p style={{ fontFamily:'sans-serif', fontSize:9, color:SUB, margin:0, lineHeight:1.4 }}>
                  Non l'abbiamo trovato. Prova con città, monumento, stato o indirizzo.
                </p>
              ) : (
                <p style={{ fontFamily:'sans-serif', fontSize:9, color:SUB, margin:0, opacity:0.85, lineHeight:1.4 }}>
                  Luogo non trovato automaticamente.<br/>Scrivi dove è stata scattata la foto.
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
