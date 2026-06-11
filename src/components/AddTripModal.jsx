import { useState, useEffect, useRef } from 'react'
import { geoToPercent, percentToGeo } from '../utils/geo'

const EMOJIS = ['✈️', '🏖️', '🏔️', '🌆', '🏛️', '🌿', '🎿', '🚢', '🏕️', '🍜', '🎭', '🌸']

export default function AddTripModal({ coords, onConfirm, onCancel }) {
  const [form, setForm] = useState({
    place_name: '',
    visit_date: '',
    note: '',
    emoji: '✈️',
    photo_url: '',
  })
  const [geo, setGeo] = useState(null)   // { lat, lng, display }
  const [geoState, setGeoState] = useState('idle') // 'idle' | 'loading' | 'found' | 'notfound'
  const debounceRef = useRef(null)

  useEffect(() => {
    const query = form.place_name.trim()
    if (!query) {
      setGeo(null)
      setGeoState('idle')
      return
    }
    clearTimeout(debounceRef.current)
    setGeoState('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'it,en' } })
        const data = await res.json()
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0]
          setGeo({ lat: parseFloat(lat), lng: parseFloat(lon), display: display_name })
          setGeoState('found')
        } else {
          setGeo(null)
          setGeoState('notfound')
        }
      } catch {
        setGeo(null)
        setGeoState('notfound')
      }
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [form.place_name])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.place_name.trim()) return

    let lat, lng
    if (geo) {
      lat = geo.lat
      lng = geo.lng
    } else {
      const fallback = percentToGeo(coords.x, coords.y)
      lat = fallback.lat
      lng = fallback.lng
    }

    onConfirm({
      place_name: form.place_name.trim(),
      visit_date: form.visit_date || null,
      note: form.note || null,
      emoji: form.emoji,
      photo_url: form.photo_url || null,
      trip_type: 'visited',
      lat,
      lng,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="relative p-6 rounded-sm w-80"
        style={{
          background: '#f8f4ef',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid #d4c4b0',
        }}
      >
        {/* Polaroid top tape effect */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-70"
          style={{ background: 'rgba(255,235,180,0.8)', border: '1px solid rgba(200,180,140,0.5)' }}
        />

        <h2
          className="text-center mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: '#3d2009', fontSize: '18px' }}
        >
          Aggiungi viaggio
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a5c3a' }}>Luogo *</label>
            <input
              className="w-full px-3 py-2 text-sm rounded-sm outline-none"
              style={{
                background: '#f0e8d8',
                border: `1px solid ${geoState === 'found' ? '#7a9a5a' : geoState === 'notfound' ? '#c07050' : '#c4aa84'}`,
                color: '#3d2009',
              }}
              placeholder="es. Roma, Italia"
              value={form.place_name}
              onChange={e => setForm(f => ({ ...f, place_name: e.target.value }))}
              autoFocus
              required
            />
            {/* Geocoder feedback */}
            {geoState === 'loading' && (
              <p className="text-xs mt-1" style={{ color: '#9a7a58' }}>Ricerca in corso…</p>
            )}
            {geoState === 'found' && geo && (
              <p className="text-xs mt-1 truncate" style={{ color: '#5a7a3a' }}>
                📍 {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </p>
            )}
            {geoState === 'notfound' && form.place_name.trim() && (
              <p className="text-xs mt-1" style={{ color: '#a05030' }}>Luogo non trovato — verrà usata la posizione del click</p>
            )}
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a5c3a' }}>Data visita</label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none"
              style={{
                background: '#f0e8d8',
                border: '1px solid #c4aa84',
                color: '#3d2009',
              }}
              value={form.visit_date}
              onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a5c3a' }}>Emoji</label>
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  className="w-8 h-8 text-lg rounded-sm"
                  style={{
                    background: form.emoji === em ? '#c4aa84' : '#f0e8d8',
                    border: `1px solid ${form.emoji === em ? '#8b6840' : '#c4aa84'}`,
                  }}
                  onClick={() => setForm(f => ({ ...f, emoji: em }))}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a5c3a' }}>Foto (opzionale)</label>
            {form.photo_url ? (
              <div className="relative">
                <img
                  src={form.photo_url}
                  alt="preview"
                  className="w-full rounded-sm object-cover"
                  style={{ height: '80px', border: '1px solid #c4aa84' }}
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
                  onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
                >×</button>
              </div>
            ) : (
              <label
                className="flex items-center justify-center gap-2 w-full py-2 text-sm rounded-sm cursor-pointer"
                style={{
                  background: '#f0e8d8',
                  border: '1px dashed #c4aa84',
                  color: '#7a5c3a',
                }}
              >
                📷 Scegli foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => setForm(f => ({ ...f, photo_url: ev.target.result }))
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#7a5c3a' }}>Nota</label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-sm outline-none resize-none"
              rows={2}
              style={{
                background: '#f0e8d8',
                border: '1px solid #c4aa84',
                color: '#3d2009',
                fontFamily: "'Caveat', cursive",
              }}
              placeholder="Un ricordo..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className="flex-1 py-2 text-sm rounded-sm"
              style={{
                background: '#e0d0b8',
                border: '1px solid #c4aa84',
                color: '#5c3d1e',
              }}
              onClick={onCancel}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm rounded-sm font-medium"
              style={{
                background: '#8b5a2b',
                border: '1px solid #6b3a1f',
                color: '#f5e6c8',
              }}
            >
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
