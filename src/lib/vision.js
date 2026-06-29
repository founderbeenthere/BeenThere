// ─────────────────────────────────────────────────────────────────────────────
// Vision Layer — client transport (Sprint 3C, punto 2)
// NESSUNA logica AI nel client: comprime l'immagine, chiama la Edge Function
// `recognize` e restituisce il CONTRATTO NORMALIZZATO così com'è, oppure `null`
// su QUALSIASI errore/timeout/abort → degradazione silenziosa (l'utente non
// aspetta mai, non vede mai un errore). Vedi memoria "beenthere-ai-vision-architecture".
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY
const ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/recognize` : null

// Downscale via canvas (≤ maxDim) → meno banda, più veloce, immagine minimizzata.
async function compress(dataURL, maxDim = 768, quality = 0.7) {
  const img = new Image()
  img.src = dataURL
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
  let { width, height } = img
  if (width > maxDim || height > maxDim) {
    const r = Math.min(maxDim / width, maxDim / height)
    width = Math.round(width * r)
    height = Math.round(height * r)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

// Ritorna il contratto normalizzato del Vision Layer, o null (degradazione).
export async function recognizePhoto({ dataURL, hasGps, context = null, locale = 'it', signal }) {
  if (!ENDPOINT || !dataURL) return null
  try {
    const image = await compress(dataURL)
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON}`,
        'apikey': ANON,
      },
      body: JSON.stringify({ image, hasGps, context, locale }),
      signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data && typeof data === 'object' ? data : null
  } catch {
    return null // rete / timeout / abort / parse → nessun suggerimento
  }
}
