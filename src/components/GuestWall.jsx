/**
 * GuestWall — Wall interattivo per lo stato TRY (non autenticato).
 *
 * Sprint 3 "Wall Full": da schermata statica a esperienza principale.
 * - verticale: zoom intermedio centrato sull'ultimo ricordo, pan + pinch;
 * - orizzontale: overview "tutto il mondo", zoom-out, polaroid → pin;
 * - hint rotazione discreto in verticale;
 * - densità adattiva polaroid/pin in base a zoom + orientamento;
 * - tap su polaroid/pin → mini dettaglio (foto, luogo, data).
 *
 * Mappa: /assets/map-hero.png (16:9). Posizioni via geoToPercent (calibrazione
 * invariata, stessa di prima). Chrome guest (logo/pill/limite 3) invariata.
 * Non tocca salvataggio, EXIF, crop, Crea Polaroid.
 */

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Polaroid from './Polaroid'
import { clearGuestTrips } from '../hooks/useGuestTrips'

const AMBER = '#C47820'
const DARK  = '#1a120a'
const SUB   = '#5a4030'
const WARM   = '#241509'   // sfondo caldo dietro la mappa (look "mappa appesa al muro")
const LIMIT  = 3

const MAP_RATIO = 9 / 16          // map-hero.png è 16:9
const PORTRAIT_SCALE = 1.5        // zoom intermedio verticale sullo stage "cover"
const MAX_SCALE = 6
const POLAROID_THRESHOLD = 1.2    // sotto = pin, sopra = polaroid
const MAX_POLAROIDS = 8           // oltre, solo pin (anti-caos)

// Coordinata valida: mai 0,0 / null / fuori range → non si mostra sulla mappa.
function isValidCoord(lat, lng) {
  return lat != null && lng != null &&
         Number.isFinite(lat) && Number.isFinite(lng) &&
         !(lat === 0 && lng === 0) &&
         Math.abs(lat) <= 90 && Math.abs(lng) <= 180
}

function useOrientation() {
  const get = () => (typeof window !== 'undefined' && window.innerWidth > window.innerHeight)
    ? 'landscape' : 'portrait'
  const [o, setO] = useState(get)
  useEffect(() => {
    const h = () => setO(get())
    window.addEventListener('resize', h)
    window.addEventListener('orientationchange', h)
    return () => {
      window.removeEventListener('resize', h)
      window.removeEventListener('orientationchange', h)
    }
  }, [])
  return o
}

// ── Puntina dorata BeenThere ──────────────────────────────────────────────────
function SmallPin({ trip, size, onSelect }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${trip.map_x}%`,
        top:  `${trip.map_y}%`,
        transform: 'translate(-50%, -50%)',
        width: size, height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #f5cc50, #C47820)',
        border: '1.5px solid #fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        zIndex: 15,
      }}
      onClick={e => { e.stopPropagation(); onSelect(trip) }}
    />
  )
}

// ── Mini dettaglio ricordo (foto, luogo, data) ───────────────────────────────
function DetailCard({ trip, onClose }) {
  const dateStr = trip.visit_date
    ? new Date(trip.visit_date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,13,4,0.45)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
          zIndex: 61, width: '84vw', maxWidth: 320,
          background: '#f8f4ef', borderRadius: 14,
          boxShadow: '0 14px 40px rgba(0,0,0,0.4)',
          padding: 14, display: 'flex', gap: 12, alignItems: 'center',
        }}
      >
        <div style={{ width: 64, height: 80, flexShrink: 0, background: '#fff', padding: '4px 4px 0', boxShadow: '1px 2px 8px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '100%', height: 56, overflow: 'hidden', background: '#d8cfc4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {trip.photo_url
              ? <img src={trip.photo_url} alt={trip.place_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <span style={{ fontSize: 24 }}>{trip.emoji || '📍'}</span>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📍 {trip.place_name}
          </p>
          {dateStr && (
            <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: SUB, margin: 0 }}>{dateStr}</p>
          )}
        </div>
        <button onClick={onClose} aria-label="Chiudi" style={{ background: 'none', border: 'none', cursor: 'pointer', color: SUB, fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
    </>
  )
}

// ── Hint rotazione telefono (discreto, non un warning) ───────────────────────
function RotateHint() {
  return (
    <div style={{
      position: 'fixed', right: 12, bottom: 86, zIndex: 45,
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '7px 12px', borderRadius: 20,
      background: 'rgba(26,13,4,0.55)',
      border: '1px solid rgba(196,170,132,0.3)',
      color: 'rgba(245,230,200,0.92)',
      fontFamily: 'sans-serif', fontSize: 12,
      pointerEvents: 'none',
      animation: 'bt-hint-in 0.4s ease-out both',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,230,200,0.92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bt-hint-tilt 2.4s ease-in-out 3' }}>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M11 18h2" />
      </svg>
      Ruota per vedere tutto il Wall
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 17 }}>📌</span>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
        <span style={{ color: '#fff' }}>Been</span><span style={{ color: '#f0b050' }}>There</span>
      </span>
    </div>
  )
}

export default function GuestWall({ guestTrips, onSaveClick, lastAddedTripId }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const touchRef     = useRef(null)

  // Init da window (mai 0): evita il frame con stageH=0 → mappa invisibile →
  // sfondo marrone dopo il WOW, finché un resize non rimisurava. (Sprint 4.1 bug 2)
  const [dims,     setDims]     = useState(() => ({
    W: typeof window !== 'undefined' ? window.innerWidth  : 1,
    H: typeof window !== 'undefined' ? window.innerHeight : 1,
  }))
  const [scale,    setScale]    = useState(PORTRAIT_SCALE)
  const [offset,   setOffset]   = useState({ x: 0, y: 0 })
  const [animating,setAnimating]= useState(false)
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected]           = useState(null)
  const [hintDismissed, setHintDismissed] = useState(false)

  const orientation = useOrientation()

  // Solo ricordi con coordinate valide (mai 0,0)
  const allValid = guestTrips.filter(t => isValidCoord(t.lat, t.lng))
  const count    = guestTrips.length
  const atLimit  = count >= LIMIT
  const lastTrip = allValid.find(t => t.id === lastAddedTripId) ?? allValid[allValid.length - 1] ?? null

  // ── Stage dimensionato per orientamento ──
  // Verticale: COVER → la mappa riempie sempre il viewport, mai vuoto ai bordi.
  // Orizzontale: CONTAIN → overview, intera mappa visibile con sfondo caldo attorno.
  const isPortrait = orientation === 'portrait'
  const stageW = isPortrait ? (dims.H / MAP_RATIO) : (dims.W || 1)
  const stageH = isPortrait ? (dims.H || 1)        : (dims.W * MAP_RATIO)
  // scala minima = 1 in entrambi gli orientamenti → la mappa riempie sempre il
  // viewport. Verticale: cover (slice di longitudini). Orizzontale: fit-width
  // (riempie la larghezza, piccolo ritaglio sopra/sotto) → più immersivo.
  const minScale = 1

  // ref aggiornati a ogni render → handler senza closure stale
  const viewRef = useRef({})
  viewRef.current = { isPortrait, stageW, stageH, W: dims.W, H: dims.H, minScale }
  const sRef = useRef(scale)
  sRef.current = scale

  const clampScale = useCallback(s => Math.max(viewRef.current.minScale, Math.min(MAX_SCALE, s)), [])
  // Blocca l'offset in entrambi gli orientamenti così la mappa copre sempre il
  // viewport (mai vuoto/nero ai bordi), sia in verticale sia in orizzontale.
  const clampOffset = useCallback((off, s) => {
    const v = viewRef.current
    const maxX = Math.max(0, (v.stageW * s - v.W) / 2)
    const maxY = Math.max(0, (v.stageH * s - v.H) / 2)
    return {
      x: Math.max(-maxX, Math.min(maxX, off.x)),
      y: Math.max(-maxY, Math.min(maxY, off.y)),
    }
  }, [])

  // ── Misura container ──
  useLayoutEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      // Fallback a window se il rect è 0 (es. durante la transizione di rotta /
      // assestamento della barra del browser) → mai stage di altezza 0.
      setDims({ W: r.width || window.innerWidth, H: r.height || window.innerHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

  // ── Calcola la vista (scale + offset) per orientamento/ultimo ricordo ──
  const computeView = useCallback((orient, trip, W, H) => {
    const isP = orient === 'portrait'
    const sw = isP ? (H / MAP_RATIO) : W
    const sh = isP ? H : (W * MAP_RATIO)
    if (!isP) {
      // fit-width: la mappa riempie la larghezza del telefono, con un piccolo
      // ritaglio sopra/sotto. Niente planisfero rimpicciolito con bordi.
      return { scale: 1, offset: { x: 0, y: 0 } }
    }
    // verticale: zoom intermedio centrato sull'ultimo ricordo, con clamp anti-vuoto
    const s = PORTRAIT_SCALE
    let off = { x: 0, y: 0 }
    if (trip) {
      off = {
        x: -s * (trip.map_x / 100 - 0.5) * sw,
        y: -s * (trip.map_y / 100 - 0.5) * sh,
      }
    }
    const maxX = Math.max(0, (sw * s - W) / 2)
    const maxY = Math.max(0, (sh * s - H) / 2)
    off = {
      x: Math.max(-maxX, Math.min(maxX, off.x)),
      y: Math.max(-maxY, Math.min(maxY, off.y)),
    }
    return { scale: s, offset: off }
  }, [])

  // ── Applica la vista a mount, cambio orientamento, nuovo ultimo ricordo ──
  useEffect(() => {
    if (!dims.W) return
    const v = computeView(orientation, lastTrip, dims.W, dims.H)
    setAnimating(true)
    setScale(v.scale)
    setOffset(v.offset)
    const t = setTimeout(() => setAnimating(false), 680)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, dims.W, dims.H, lastTrip?.id])

  // ── Hint rotazione: in verticale sparisce da solo dopo 6s ──
  // Visibilità DERIVATA in render (showHint) — niente stato separato che possa
  // disallinearsi: qui c'è solo il timer di auto-dismiss.
  useEffect(() => {
    if (orientation !== 'portrait') return
    const t = setTimeout(() => setHintDismissed(true), 6000)
    return () => clearTimeout(t)
  }, [orientation])

  const markInteracted = useCallback(() => {
    setHintDismissed(true)
  }, [])

  // ── Mouse (desktop) ──
  const handleWheel = useCallback(e => {
    e.preventDefault()
    markInteracted()
    const factor = e.deltaY < 0 ? 1.15 : 0.87
    const ns = clampScale(sRef.current * factor)
    setScale(ns)
    setOffset(o => clampOffset(o, ns))
  }, [markInteracted, clampScale, clampOffset])

  const handleMouseDown = useCallback(e => {
    setDragging(true)
    touchRef.current = { type: 'mouse', startX: e.clientX - offset.x, startY: e.clientY - offset.y, hasDragged: false }
  }, [offset])

  const handleMouseMove = useCallback(e => {
    const ts = touchRef.current
    if (!ts || ts.type !== 'mouse') return
    ts.hasDragged = true
    setOffset(clampOffset({ x: e.clientX - ts.startX, y: e.clientY - ts.startY }, sRef.current))
  }, [clampOffset])

  const handleMouseUp = useCallback(() => {
    const ts = touchRef.current
    if (ts?.type === 'mouse') {
      if (ts.hasDragged) markInteracted()
      else setSelected(null)
    }
    setDragging(false)
    touchRef.current = null
  }, [markInteracted])

  // ── Touch (mobile): pan 1 dito, pinch 2 dita. touchmove non-passive. ──
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onTouchMove(e) {
      const ts = touchRef.current
      if (!ts) return
      if (e.touches.length === 1 && ts.type === 'pan') {
        e.preventDefault()
        ts.hasDragged = true
        const t = e.touches[0]
        setOffset(clampOffset({ x: t.clientX - ts.startX, y: t.clientY - ts.startY }, sRef.current))
      } else if (e.touches.length === 2 && ts.type === 'pinch') {
        e.preventDefault()
        const d = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        )
        const ns = clampScale(ts.baseScale * (d / ts.baseDist))
        setScale(ns)
        setOffset(o => clampOffset(o, ns))
      }
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  const handleTouchStart = useCallback(e => {
    markInteracted()
    if (e.touches.length === 1) {
      const t = e.touches[0]
      touchRef.current = { type: 'pan', startX: t.clientX - offset.x, startY: t.clientY - offset.y, hasDragged: false }
    } else if (e.touches.length === 2) {
      touchRef.current = {
        type: 'pinch',
        baseScale: scale,
        baseDist: Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        ),
      }
    }
  }, [offset, scale, markInteracted])

  const handleTouchEnd = useCallback(e => {
    const ts = touchRef.current
    if (ts?.type === 'pan' && !ts.hasDragged) setSelected(null)
    if (e.touches.length === 0) touchRef.current = null
  }, [])

  // ── Densità: polaroid vs pin ──
  const showPolaroids = scale >= POLAROID_THRESHOLD && allValid.length <= MAX_POLAROIDS
  const polaroidBase  = showPolaroids ? allValid.slice(0, MAX_POLAROIDS) : []
  // L'ultima/nuova polaroid SEMPRE renderizzata per ultima → in cima a quelle
  // vicine sovrapposte (es. Ferrara su Monza). Evita che si veda la foto vecchia.
  const polaroidTrips = lastTrip
    ? [...polaroidBase.filter(t => t.id !== lastTrip.id), ...polaroidBase.filter(t => t.id === lastTrip.id)]
    : polaroidBase
  const polaroidIds   = new Set(polaroidTrips.map(t => t.id))
  const pinTrips      = allValid.filter(t => !polaroidIds.has(t.id))
  const pinSize       = orientation === 'landscape' ? 11 : 13

  // Offset sempre clampato nel render → la mappa non mostra mai il vuoto ai bordi
  const viewOffset = clampOffset(offset, scale)

  const stageTransition = animating
    ? 'transform 0.66s cubic-bezier(0.22,0.61,0.36,1)'
    : 'none'

  // Hint visibile solo in verticale, con ricordi, finché non auto-dismisso o toccato
  const showHint = orientation === 'portrait' && allValid.length > 0 && !hintDismissed

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100dvh',
        overflow: 'hidden', background: WARM,
        touchAction: 'none', userSelect: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes bt-wall-pop {
          0%   { opacity:0; transform: translateY(-14px) scale(0.9); }
          60%  { opacity:1; transform: translateY(3px)  scale(1.04); }
          80%  { transform: translateY(-1px) scale(0.99); }
          100% { transform: translateY(0)    scale(1); }
        }
        @keyframes bt-hint-in  { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes bt-hint-tilt { 0%,55%,100% { transform: rotate(0deg); } 75% { transform: rotate(78deg); } }
      `}</style>

      {/* ── STAGE (mappa + pin + polaroid) — zoomabile/pannabile ── */}
      {dims.W > 0 && (
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: stageW, height: stageH,
            marginLeft: -stageW / 2, marginTop: -stageH / 2,
            transformOrigin: 'center center',
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${scale})`,
            transition: stageTransition,
            willChange: 'transform',
          }}
        >
          <img
            src="/assets/map-hero.png"
            alt="mappa BeenThere"
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', pointerEvents: 'none' }}
            draggable={false}
          />

          {/* Pin — sempre per i ricordi non mostrati come polaroid */}
          {pinTrips.map(trip => (
            <SmallPin key={`pin-${trip.id}`} trip={trip} size={pinSize} onSelect={setSelected} />
          ))}

          {/* Polaroid — zoom-in, max 8, con animazione sull'ultima aggiunta */}
          {polaroidTrips.map(trip => (
            <Polaroid
              key={`pol-${trip.id}`}
              trip={trip}
              onSelect={setSelected}
              isNew={trip.id === lastTrip?.id}
            />
          ))}
        </div>
      )}

      {/* ── CHROME — overlay non trasformati ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', pointerEvents: 'none' }}>
        <Logo />
        {allValid.length > 0 && (
          <div style={{
            padding: '4px 12px', background: AMBER, borderRadius: 20,
            color: '#fff', fontSize: 12, fontFamily: 'sans-serif', fontWeight: 600,
            letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {count}/{LIMIT} ricordi
          </div>
        )}
      </div>

      {/* CTA in basso — più discreta in orizzontale per non coprire il centro mappa */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: isPortrait ? 22 : 8, zIndex: 40,
        display: 'flex', flexDirection: isPortrait ? 'column' : 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: isPortrait ? 10 : 8, padding: '0 24px', pointerEvents: 'none',
      }}>
        {allValid.length === 0 ? (
          <button onClick={() => navigate('/try')} style={{ ...ctaPrimary, ...ctaLandscape(isPortrait), pointerEvents: 'auto' }}>
            📸 Carica la tua prima foto
          </button>
        ) : (
          <>
            <button onClick={onSaveClick} style={{ ...ctaPrimary, ...ctaLandscape(isPortrait), pointerEvents: 'auto' }}>
              Salva i tuoi ricordi
            </button>
            <button
              onClick={() => { if (!atLimit) navigate('/try') }}
              disabled={atLimit}
              style={{ ...ctaSecondary, ...ctaLandscape(isPortrait), pointerEvents: 'auto', opacity: atLimit ? 0.5 : 1, cursor: atLimit ? 'not-allowed' : 'pointer' }}
            >
              {atLimit ? 'Limite raggiunto (3/3)' : '+ Aggiungi una foto'}
            </button>
          </>
        )}
      </div>

      {/* Hint rotazione */}
      {showHint && <RotateHint />}

      {/* Dettaglio ricordo */}
      {selected && <DetailCard trip={selected} onClose={() => setSelected(null)} />}

      {/* SOLO in development: reset rapido dello stato Guest per i test.
          import.meta.env.DEV è false in build di produzione → non viene incluso. */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            clearGuestTrips()
            try { localStorage.removeItem('beenthere_pending_intent') } catch { /* noop */ }
            navigate('/try')
          }}
          style={{
            position: 'fixed', left: 8, bottom: 8, zIndex: 60,
            fontSize: 10, padding: '4px 8px', borderRadius: 6,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
          }}
        >
          ↺ reset guest (dev)
        </button>
      )}
    </div>
  )
}

const ctaPrimary = {
  width: '100%', maxWidth: 440, padding: '14px 24px',
  background: AMBER, border: 'none', borderRadius: 40,
  color: '#fff', fontSize: 16, fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  letterSpacing: '0.03em', cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(196,120,32,0.4)',
}

const ctaSecondary = {
  width: '100%', maxWidth: 440, padding: '12px 24px',
  background: 'rgba(248,244,239,0.92)',
  border: `1.5px solid ${AMBER}`, borderRadius: 40,
  color: AMBER, fontSize: 15, fontWeight: 600,
  fontFamily: "'Playfair Display', serif", letterSpacing: '0.02em',
}

// In orizzontale: CTA compatte (auto-larghe, basse) per non coprire il centro mappa
function ctaLandscape(isPortrait) {
  if (isPortrait) return {}
  return { width: 'auto', maxWidth: 260, padding: '8px 18px', fontSize: 13, borderRadius: 30 }
}
