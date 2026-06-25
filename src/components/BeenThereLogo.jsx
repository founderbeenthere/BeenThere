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
  const w = Math.round(fontSize * 0.44)
  const h = Math.round(fontSize * 1.15)
  return (
    <svg
      width={w} height={h}
      viewBox="0 0 9 22"
      fill="none"
      style={{ marginLeft: 1, flexShrink: 0, verticalAlign: 'middle' }}
    >
      {/* Testa della pin */}
      <circle cx="4.5" cy="5" r="4" fill="#D4860A"/>
      <circle cx="4.5" cy="5" r="4" stroke="#A05808" strokeWidth="0.6"/>
      {/* Riflesso */}
      <ellipse cx="3" cy="3.2" rx="1.5" ry="1" fill="rgba(255,235,140,0.42)"/>
      {/* Ago */}
      <line x1="4.5" y1="9.2" x2="4.5" y2="21" stroke="#A05808" strokeWidth="1.6" strokeLinecap="round"/>
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
