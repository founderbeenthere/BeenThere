// Simulazione DETERMINISTICA dei 5 casi richiesti, eseguendo la logica REALE di
// core.ts. Mima l'orchestrazione di index.ts (key mancante / provider che lancia
// → emptyResponse) senza Deno né rete. Prova contratto + degradazione.
// Run: node supabase/functions/recognize/core.cases.mjs
import { normalize, emptyResponse } from './core.ts'

const PROVIDER = 'gemini-flash'
const T = { high: 0.90, med: 0.90 } // v1 conservativa

// Mima index.ts: se manca la key → empty; se il provider lancia (timeout/errore) → empty.
async function handle({ providerResult, hasGps, hasKey = true }) {
  if (!hasKey) return emptyResponse(PROVIDER)
  try {
    const raw = typeof providerResult === 'function' ? await providerResult() : providerResult
    return normalize(raw, { provider: PROVIDER, hasGps, thresholds: T })
  } catch {
    return emptyResponse(PROVIDER) // degradazione silenziosa
  }
}

const monument = {
  subject: 'Colosseo', category: 'Monumenti', categoryConfidence: 0.96,
  place: { name: 'Colosseo', country: 'Italia', lat: 41.8902, lng: 12.4922, confidence: 0.95 },
}

const cases = [
  ['1. Foto CON GPS + monumento', { providerResult: monument, hasGps: true }],
  ['2. Foto SENZA GPS + monumento', { providerResult: monument, hasGps: false }],
  ['3a. Foto normale (paesaggio) confidente', { providerResult: { subject: 'spiaggia tropicale', category: 'Mare', categoryConfidence: 0.93, place: null }, hasGps: false }],
  ['3b. Foto normale (persona) non confidente', { providerResult: { subject: 'ritratto', category: 'Persone', categoryConfidence: 0.55, place: null }, hasGps: false }],
  ['4. Confidence bassa', { providerResult: { subject: '?', category: 'Monumenti', categoryConfidence: 0.42, place: null }, hasGps: false }],
  ['5a. Provider ERRORE / timeout', { providerResult: () => { throw new Error('gemini http 503') }, hasGps: false }],
  ['5b. Key mancante', { providerResult: monument, hasGps: false, hasKey: false }],
]

// Validatore di forma del contratto (la chiave: nessun caso deve uscire dal contratto).
function validShape(r) {
  if (typeof r !== 'object' || r === null) return false
  if (typeof r.ok !== 'boolean' || typeof r.provider !== 'string') return false
  const c = r.category
  if (!c || !['auto', 'verify', 'none'].includes(c.decision) || typeof c.confidence !== 'number') return false
  if (!(c.value === null || typeof c.value === 'string')) return false
  if (!(r.place === null || (typeof r.place === 'object' && ['auto', 'verify', 'none'].includes(r.place.decision)))) return false
  return true
}

let allOk = true
for (const [name, input] of cases) {
  const r = await handle(input)
  const shapeOk = validShape(r)
  if (!shapeOk) allOk = false
  console.log(`\n${name}  ${shapeOk ? '✓ contratto valido' : '✗ FUORI CONTRATTO'}`)
  console.log('  category:', JSON.stringify(r.category), '| place:', JSON.stringify(r.place), '| ok:', r.ok)
}

console.log(`\n${allOk ? '✓ TUTTI i casi restano nel contratto (nessun errore lato client)' : '✗ qualche caso fuori contratto'}`)
process.exit(allOk ? 0 : 1)
