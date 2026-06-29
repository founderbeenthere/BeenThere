// Test della logica pura di core.ts (Node 24 type-stripping). Dev-only, NON
// viene incluso nel deploy (Supabase bundla solo il grafo di index.ts).
// Run:  node supabase/functions/recognize/core.test.mjs
import { decide, validCategory, normalize, emptyResponse, CATEGORIES } from './core.ts'

let pass = 0, fail = 0
const eq = (name, got, exp) => {
  const g = JSON.stringify(got), e = JSON.stringify(exp)
  if (g === e) { pass++; } else { fail++; console.log(`✗ ${name}\n   got ${g}\n   exp ${e}`) }
}

// v1 conservativa: high = med = 0.90 → niente banda "verify"
const T = { high: 0.90, med: 0.90 }
eq('decide 0.95 → auto', decide(0.95, T), 'auto')
eq('decide 0.90 → auto', decide(0.90, T), 'auto')
eq('decide 0.89 → none (medio escluso in v1)', decide(0.89, T), 'none')
eq('decide 0.50 → none', decide(0.50, T), 'none')
eq('decide NaN → none', decide(NaN, T), 'none')

// con verify attiva (med < high)
const T2 = { high: 0.90, med: 0.75 }
eq('decide 0.80 → verify', decide(0.80, T2), 'verify')
eq('decide 0.74 → none', decide(0.74, T2), 'none')

// validazione categoria contro enum
eq('cat "Monumenti" → Monumenti', validCategory('Monumenti'), 'Monumenti')
eq('cat "monumenti" → Monumenti', validCategory('monumenti'), 'Monumenti')
eq('cat "Altro" → null', validCategory('Altro'), null)
eq('cat "Pizza" (fuori enum) → null', validCategory('Pizza'), null)
eq('cat null → null', validCategory(null), null)

// normalize: hasGps=true ⇒ place OMESSO anche se il provider lo manda
const rawWithPlace = {
  subject: 'Hagia Sophia', category: 'Monumenti', categoryConfidence: 0.95,
  place: { name: 'Hagia Sophia', country: 'Türkiye', lat: 41.0, lng: 28.9, confidence: 0.95 },
}
const rGps = normalize(rawWithPlace, { provider: 'p', hasGps: true, thresholds: T })
eq('GPS presente → place null', rGps.place, null)
eq('GPS presente → categoria auto', rGps.category, { value: 'Monumenti', confidence: 0.95, decision: 'auto' })
eq('GPS presente → ok true', rGps.ok, true)

// normalize: hasGps=false ⇒ place valorizzato con banda
const rNoGps = normalize(rawWithPlace, { provider: 'p', hasGps: false, thresholds: T })
eq('no-GPS → place auto', rNoGps.place.decision, 'auto')
eq('no-GPS → place name', rNoGps.place.name, 'Hagia Sophia')

// normalize: categoria fuori enum → null/none, niente invenzioni
const rBad = normalize(
  { subject: 'x', category: 'Spaghetti', categoryConfidence: 0.99, place: null },
  { provider: 'p', hasGps: true, thresholds: T },
)
eq('categoria fuori enum → value null', rBad.category.value, null)
eq('categoria fuori enum → decision none', rBad.category.decision, 'none')
eq('niente proponibile → ok false', rBad.ok, false)

// normalize: confidence bassa → none (conservativo)
const rLow = normalize(
  { subject: 'x', category: 'Mare', categoryConfidence: 0.4, place: null },
  { provider: 'p', hasGps: true, thresholds: T },
)
eq('cat valida ma confidence bassa → none', rLow.category.decision, 'none')

// degradazione silenziosa
const empty = emptyResponse('p')
eq('emptyResponse ok false', empty.ok, false)
eq('emptyResponse decision none', empty.category.decision, 'none')
eq('emptyResponse place null', empty.place, null)

// sanity enum
eq('enum contiene Monumenti e Altro', CATEGORIES.includes('Monumenti') && CATEGORIES.includes('Altro'), true)

console.log(`\n${pass} passati, ${fail} falliti`)
process.exit(fail ? 1 : 0)
