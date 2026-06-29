// ─────────────────────────────────────────────────────────────────────────────
// Vision Layer — EDGE FUNCTION `recognize` (Sprint 3B, punto 1)
// Il "primo mattone" del motore AI di BeenThere.
//  • riceve un'immagine compressa (dal client)
//  • interroga il provider (Gemini Flash) — con timeout
//  • restituisce la risposta NORMALIZZATA (vedi core.ts)
//  • degrada SEMPRE in modo silenzioso: errore/timeout/quota → 200 + "nessun
//    suggerimento" (mai un errore che il client debba gestire).
// Deploy: supabase functions deploy recognize --no-verify-jwt
// (no-verify-jwt perché il Guest non ha sessione; va protetta a parte: rate-limit.)
// Secret necessario: GEMINI_API_KEY  (supabase secrets set GEMINI_API_KEY=...)
// ─────────────────────────────────────────────────────────────────────────────

import { geminiRecognize } from "./gemini.ts"
import { parseRequest, splitImage, normalize, emptyResponse, type Thresholds } from "./core.ts"

const PROVIDER = "gemini-flash"
const MODEL = Deno.env.get("VISION_MODEL") ?? "gemini-2.0-flash"
const API_KEY = Deno.env.get("GEMINI_API_KEY") ?? ""
const TIMEOUT_MS = Number(Deno.env.get("VISION_TIMEOUT_MS") ?? "4500")

// Soglie come CONFIG server-side (tarabili in beta via telemetria, non definitive).
// v1 conservativa: med = high → niente banda "verify" (medio = nessun suggerimento).
const THRESHOLDS: Thresholds = {
  high: Number(Deno.env.get("VISION_CONF_HIGH") ?? "0.90"),
  med: Number(Deno.env.get("VISION_CONF_MED") ?? "0.90"),
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
}
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } })

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405)

  // Parsing + validazione richiesta
  let body: unknown
  try { body = await req.json() } catch { return json({ error: "invalid json" }, 400) }
  const parsed = parseRequest(body)
  if (!parsed.ok) return json({ error: parsed.error }, 400)
  const reqv = parsed.req

  // Provider non configurato (es. key mancante in dev) → degradazione silenziosa.
  if (!API_KEY) return json(emptyResponse(PROVIDER))

  // Chiamata provider con timeout. QUALSIASI errore → "nessun suggerimento".
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const { base64, mime } = splitImage(reqv.image)
    const raw = await geminiRecognize(
      { base64, mime, hasGps: reqv.hasGps, context: reqv.context, locale: reqv.locale ?? "it" },
      { apiKey: API_KEY, model: MODEL, signal: ctrl.signal },
    )
    return json(normalize(raw, { provider: PROVIDER, hasGps: reqv.hasGps, thresholds: THRESHOLDS }))
  } catch (_err) {
    return json(emptyResponse(PROVIDER))
  } finally {
    clearTimeout(timer)
  }
})
