/**
 * BeenThereLogo — Logo ufficiale BeenThere!
 *
 * "Been"  → nero #1a120a
 * "There" → dorato #C47820
 * "!"     → pin SVG ufficiale (NON emoji, NON testo)
 *
 * Prop size: riferimento alla font-size del wordmark (default 18).
 * La pin si scala proporzionalmente.
 */

const DARK  = '#1a120a'
const AMBER = '#C47820'

function PinMark({ fontSize }) {
  // La pin sostituisce il "!" — deve avere peso visivo simile a un punto esclamativo
  // Testa grande (≈ punto del "!"), ago lungo (≈ linea del "!")
  const w = Math.round(fontSize * 0.58)
  const h = Math.round(fontSize * 1.32)
  return (
    <svg
      width={w} height={h}
      viewBox="0 0 11 26"
      fill="none"
      style={{ marginLeft: 1, flexShrink: 0, verticalAlign: 'middle' }}
    >
      {/* Testa della pin — grande, legge come il "punto" dell'! */}
      <circle cx="5.5" cy="5.5" r="5" fill="#D4860A"/>
      <circle cx="5.5" cy="5.5" r="5" stroke="#A05808" strokeWidth="0.7"/>
      {/* Riflesso */}
      <ellipse cx="3.6" cy="3.5" rx="2" ry="1.3" fill="rgba(255,235,140,0.40)"/>
      {/* Ago — lungo, legge come la "linea" dell'! */}
      <line x1="5.5" y1="11.2" x2="5.5" y2="25" stroke="#A05808" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function BeenThereLogo({ size = 18 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, lineHeight: 1 }}>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size, fontWeight: 700, color: DARK,
        letterSpacing: '0.01em',
      }}>Been</span>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size, fontWeight: 700, color: AMBER,
        letterSpacing: '0.01em',
      }}>There</span>
      <PinMark fontSize={size}/>
    </div>
  )
}
