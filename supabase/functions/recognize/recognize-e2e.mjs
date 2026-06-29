// Test END-TO-END della Edge Function `recognize` DEPLOYATA. Dependency-free.
// Lo esegui TU dopo il deploy (io non ho accesso al tuo Supabase né alla key).
//
// Uso:
//   node supabase/functions/recognize/recognize-e2e.mjs <FUNCTION_URL> <ANON_KEY> <image.jpg> [--gps 41.89,12.49]
//
// FUNCTION_URL es: https://<project-ref>.supabase.co/functions/v1/recognize
// ANON_KEY      = la tua Supabase anon key (header Authorization).
// image.jpg     = una foto ≤ ~1.5MB (il client vero comprimerà; per il test usa
//                 un'immagine già moderata, o riducila).
// --gps lat,lng = simula "foto CON GPS" (la funzione deve OMETTERE place).
//                 Senza --gps = "foto SENZA GPS" (la funzione può proporre place).

import { readFileSync } from 'node:fs'

const [, , url, anonKey, imagePath, ...rest] = process.argv
if (!url || !anonKey || !imagePath) {
  console.error('Uso: node recognize-e2e.mjs <FUNCTION_URL> <ANON_KEY> <image.jpg> [--gps lat,lng]')
  process.exit(2)
}
const gpsArg = rest.includes('--gps') ? rest[rest.indexOf('--gps') + 1] : null
const context = gpsArg ? { lat: +gpsArg.split(',')[0], lng: +gpsArg.split(',')[1] } : null
const hasGps = !!gpsArg

const buf = readFileSync(imagePath)
if (buf.length > 1_600_000) {
  console.warn(`⚠ immagine ${(buf.length / 1e6).toFixed(1)}MB: oltre il cap della funzione. Usa una foto più piccola.`)
}
const mime = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
const image = `data:${mime};base64,${buf.toString('base64')}`

function validShape(r) {
  if (typeof r !== 'object' || r === null) return false
  if (typeof r.ok !== 'boolean' || typeof r.provider !== 'string') return false
  const c = r.category
  if (!c || !['auto', 'verify', 'none'].includes(c.decision)) return false
  if (!(c.value === null || typeof c.value === 'string')) return false
  if (hasGps && r.place !== null) return false // regola: GPS presente ⇒ place OMESSO
  if (!(r.place === null || ['auto', 'verify', 'none'].includes(r.place.decision))) return false
  return true
}

const t0 = Date.now()
try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}`, 'apikey': anonKey },
    body: JSON.stringify({ image, hasGps, context, locale: 'it' }),
  })
  const ms = Date.now() - t0
  const body = await res.json()
  const shapeOk = validShape(body)
  console.log(`HTTP ${res.status}  (${ms}ms)  hasGps=${hasGps}`)
  console.log(JSON.stringify(body, null, 2))
  console.log(shapeOk ? '\n✓ Risposta DENTRO il contratto' : '\n✗ Risposta FUORI contratto (controlla)')
  // NB: process.exitCode (non process.exit) per evitare l'assertion libuv di Node
  // su Windows quando si forza l'uscita con socket fetch ancora in chiusura.
  process.exitCode = shapeOk ? 0 : 1
} catch (e) {
  console.error('Errore di rete verso la funzione:', String(e))
  process.exitCode = 1
}
