import { useState, useEffect, useRef } from 'react'
import { percentToGeo } from '../utils/geo'
import { uploadPhoto }  from '../lib/storage'

const EMOJIS = ['✈️', '🏖️', '🏔️', '🌆', '🏛️', '🌿', '🎿', '🚢', '🏕️', '🍜', '🎭', '🌸']
const NOTE_MAX = 200

// ── Mini polaroid preview ────────────────────────────────────────────────────
function PolaroidPreview({ photoSrc, emoji, placeName }) {
  return (
    <div
      style={{
        width: 80,
        background: '#fff',
        boxShadow: '2px 4px 10px rgba(0,0,0,0.25)',
        padding: '4px 4px 0',
        transform: 'rotate(-2deg)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: 60,
          background: '#d8cfc4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {photoSrc ? (
          <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 28 }}>{emoji || '📍'}</span>
        )}
      </div>
      <div
        style={{
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 8,
            color: '#3d2009',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 68,
          }}
        >
          {placeName || 'Il tuo posto'}
        </span>
      </div>
    </div>
  )
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function AddTripModal({ coords, userId, onConfirm, onCancel }) {
  const [form, setForm] = useState({
    place_name: '',
    visit_date: '',
    note: '',
    emoji: '✈️',
  })
  const [geo,         setGeo]         = useState(null)
  const [geoState,    setGeoState]    = useState('idle') // idle|loading|found|notfound
  const [suggestions, setSuggestions] = useState([])
  const [showSugg,    setShowSugg]    = useState(false)

  const [photoFile,     setPhotoFile]     = useState(null)   // File object
  const [photoPreview,  setPhotoPreview]  = useState('')     // data URL for preview
  const [uploading,     setUploading]     = useState(false)
  const [uploadedUrl,   setUploadedUrl]   = useState('')     // final Storage URL

  const debounceRef = useRef(null)
  const inputRef    = useRef(null)

  // ── Geocode with autocomplete ──────────────────────────────────────────────
  useEffect(() => {
    const query = form.place_name.trim()
    if (!query) { setSuggestions([]); setGeo(null); setGeoState('idle'); return }
    clearTimeout(debounceRef.current)
    setGeoState('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'it,en' } },
        )
        const data = await res.json()
        if (data.length > 0) {
          setSuggestions(data)
          setShowSugg(true)
          // Auto-select first result as geo
          setGeo({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name })
          setGeoState('found')
        } else {
          setSuggestions([])
          setGeo(null)
          setGeoState('notfound')
        }
      } catch {
        setSuggestions([])
        setGeo(null)
        setGeoState('notfound')
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [form.place_name])

  function selectSuggestion(item) {
    setForm(f => ({ ...f, place_name: item.display_name.split(',')[0].trim() }))
    setGeo({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), display: item.display_name })
    setGeoState('found')
    setSuggestions([])
    setShowSugg(false)
  }

  // ── Photo handling ──────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setUploadedUrl('')
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview('')
    setUploadedUrl('')
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.place_name.trim()) return

    let lat, lng
    if (geo) {
      lat = geo.lat; lng = geo.lng
    } else {
      const fb = percentToGeo(coords.x, coords.y)
      lat = fb.lat; lng = fb.lng
    }

    // Upload photo if one was selected
    let finalPhotoUrl = uploadedUrl
    if (photoFile && !uploadedUrl && userId) {
      setUploading(true)
      try {
        finalPhotoUrl = await uploadPhoto(photoFile, userId)
        setUploadedUrl(finalPhotoUrl)
      } catch (err) {
        console.warn('Upload foto fallito:', err.message)
        finalPhotoUrl = ''
      } finally {
        setUploading(false)
      }
    }

    onConfirm({
      place_name: form.place_name.trim(),
      visit_date: form.visit_date || null,
      note:       form.note || null,
      emoji:      form.emoji,
      photo_url:  finalPhotoUrl || null,
      trip_type:  'visited',
      lat,
      lng,
    })
  }

  const canSubmit = geoState === 'found' && !uploading

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="relative w-80 max-h-screen overflow-y-auto"
        style={{
          background: '#f8f4ef',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid #d4c4b0',
          borderRadius: 4,
          padding: '40px 24px 24px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Tape */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-70"
          style={{ background: 'rgba(255,235,180,0.85)', border: '1px solid rgba(200,180,140,0.4)' }}
        />

        {/* Header with polaroid preview */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <PolaroidPreview
            photoSrc={photoPreview}
            emoji={form.emoji}
            placeName={form.place_name}
          />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#3d2009', fontSize: 18, margin: 0, paddingTop: 4 }}>
            Aggiungi<br />viaggio
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Place */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Luogo *</label>
            <input
              ref={inputRef}
              style={{
                ...inputStyle,
                border: `1px solid ${geoState === 'found' ? '#7a9a5a' : geoState === 'notfound' ? '#c07050' : '#c4aa84'}`,
              }}
              placeholder="es. Roma, Tokyo, Parigi…"
              value={form.place_name}
              onChange={e => { setForm(f => ({ ...f, place_name: e.target.value })); setShowSugg(true) }}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              autoFocus
              required
            />
            {/* Autocomplete dropdown */}
            {showSugg && suggestions.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#f8f4ef',
                  border: '1px solid #c4aa84',
                  borderTop: 'none',
                  borderRadius: '0 0 3px 3px',
                  zIndex: 10,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#3d2009',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e8ddd0',
                      fontFamily: 'sans-serif',
                      lineHeight: 1.3,
                    }}
                    onMouseDown={() => selectSuggestion(item)}
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
            {geoState === 'loading' && <p style={hintStyle}>Ricerca…</p>}
            {geoState === 'found' && geo && (
              <p style={{ ...hintStyle, color: '#5a7a3a' }}>
                📍 {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </p>
            )}
            {geoState === 'notfound' && form.place_name.trim() && (
              <p style={{ ...hintStyle, color: '#a05030' }}>Luogo non trovato</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Data visita</label>
            <input
              type="date"
              style={inputStyle}
              value={form.visit_date}
              onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
            />
          </div>

          {/* Emoji */}
          <div>
            <label style={labelStyle}>Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  style={{
                    width: 32, height: 32,
                    fontSize: 17,
                    borderRadius: 3,
                    background: form.emoji === em ? '#c4aa84' : '#f0e8d8',
                    border: `1px solid ${form.emoji === em ? '#8b6840' : '#c4aa84'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setForm(f => ({ ...f, emoji: em }))}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label style={labelStyle}>Foto (opzionale)</label>
            {photoPreview ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt="preview"
                  style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 3, border: '1px solid #c4aa84', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: '#c0392b',
                    border: 'none',
                    color: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '10px',
                  background: '#f0e8d8',
                  border: '1px dashed #c4aa84',
                  borderRadius: 3,
                  color: '#7a5c3a',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                📷 Scegli foto
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Note */}
          <div>
            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
              <span>Nota</span>
              <span style={{ color: form.note.length > NOTE_MAX * 0.85 ? '#c07050' : '#9a7a58' }}>
                {form.note.length}/{NOTE_MAX}
              </span>
            </label>
            <textarea
              rows={2}
              maxLength={NOTE_MAX}
              style={{
                ...inputStyle,
                resize: 'none',
                fontFamily: "'Caveat', cursive",
                fontSize: 14,
              }}
              placeholder="Un ricordo…"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '10px',
                background: '#e0d0b8',
                border: '1px solid #c4aa84',
                borderRadius: 3,
                color: '#5c3d1e',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                flex: 1, padding: '10px',
                background: canSubmit ? '#8b5a2b' : '#c4aa84',
                border: `1px solid ${canSubmit ? '#6b3a1f' : '#b09070'}`,
                borderRadius: 3,
                color: canSubmit ? '#f5e6c8' : '#f0e8d8',
                fontSize: 13,
                fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {uploading ? 'Upload…' : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  color: '#7a5c3a',
  marginBottom: 5,
  letterSpacing: '0.03em',
  fontFamily: 'sans-serif',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  background: '#f0e8d8',
  border: '1px solid #c4aa84',
  borderRadius: 3,
  color: '#3d2009',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
}

const hintStyle = {
  fontSize: 11,
  marginTop: 4,
  color: '#9a7a58',
  fontFamily: 'sans-serif',
}
