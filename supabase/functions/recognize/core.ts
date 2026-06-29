// ─────────────────────────────────────────────────────────────────────────────
// Vision Layer — CORE (Sprint 3B, punto 1)
// Logica pura del contratto: indipendente da host (Supabase/Vercel) e provider
// (Gemini/OpenAI/Claude). Qui vivono: enum categorie, bande di confidence,
// validazione e normalizzazione. Niente fetch, niente env, niente UI → testabile.
// Architettura: vedi memoria di progetto "beenthere-ai-vision-architecture".
// ─────────────────────────────────────────────────────────────────────────────

// Enum categorie — DEVE coincidere con CATEGORIES del client (TryCreatePolaroid).
export const CATEGORIES = [
  "Viaggio", "Natura", "Mare", "Montagna", "Città",
  "Monumenti", "Cultura", "Arte", "Cibo", "Eventi",
  "Persone", "Sport", "Altro",
] as const
export type Category = (typeof CATEGORIES)[number]

export type Decision = "auto" | "verify" | "none"

export interface Thresholds {
  high: number   // ≥ high  → "auto"  (proposta automatica)
  med: number    // ≥ med   → "verify" (proposta da confermare)
}

// Confidence → banda decisione. La soglia è server-side (config), il client
// riceve già la `decision` e non vede mai il numero.
// v1 BeenThere conservativa: di default med = high → la banda "verify" non scatta
// (confidence media = nessun suggerimento). Abbassando med si riattiva in futuro.
export function decide(confidence: number, t: Thresholds): Decision {
  if (typeof confidence !== "number" || !isFinite(confidence)) return "none"
  if (confidence >= t.high) return "auto"
  if (confidence >= t.med) return "verify"
  return "none"
}

// Output GREZZO del provider (non ancora normalizzato in bande/enum).
export interface RawRecognition {
  subject: string | null
  category: string | null         // libero dal modello → validato contro l'enum
  categoryConfidence: number      // 0..1
  place: {
    name: string | null
    country: string | null
    lat: number | null
    lng: number | null
    confidence: number            // 0..1
  } | null
}

// Risposta NORMALIZZATA — contratto client/server approvato.
export interface RecognizeResponse {
  ok: boolean                     // true se almeno un campo è proponibile
  provider: string
  subject: string | null
  category: { value: Category | null; confidence: number; decision: Decision }
  place: {
    name: string | null; country: string | null
    lat: number | null; lng: number | null
    confidence: number; decision: Decision
  } | null
}

function clamp01(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n)
  if (!isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}
function finiteOrNull(n: unknown): number | null {
  return typeof n === "number" && isFinite(n) ? n : null
}

// Valida la categoria del modello contro l'enum. "Altro" = nessun suggerimento
// utile (è il default), quindi → null. Categoria fuori lista → null (mai inventata).
export function validCategory(value: string | null): Category | null {
  if (!value) return null
  const hit = CATEGORIES.find(c => c.toLowerCase() === String(value).trim().toLowerCase())
  return !hit || hit === "Altro" ? null : hit
}

// Risposta "nessun suggerimento" — usata per la DEGRADAZIONE SILENZIOSA
// (provider non configurato, errore, timeout, quota). ok:false, tutto "none".
export function emptyResponse(provider: string): RecognizeResponse {
  return {
    ok: false, provider, subject: null,
    category: { value: null, confidence: 0, decision: "none" },
    place: null,
  }
}

// Normalizza il grezzo del provider nel contratto, applicando le REGOLE approvate:
//  • hasGps=true ⇒ place OMESSO (l'AI non tocca mai il luogo quando c'è il GPS);
//  • categoria vincolata all'enum (mai inventata);
//  • decision calcolata server-side dalla confidence.
export function normalize(
  raw: RawRecognition,
  opts: { provider: string; hasGps: boolean; thresholds: Thresholds },
): RecognizeResponse {
  const { provider, hasGps, thresholds } = opts

  const catValue = validCategory(raw?.category ?? null)
  const catConf = catValue ? clamp01(raw?.categoryConfidence) : 0
  const category = {
    value: catValue,
    confidence: catConf,
    decision: catValue ? decide(catConf, thresholds) : ("none" as Decision),
  }

  let place: RecognizeResponse["place"] = null
  if (!hasGps && raw?.place && raw.place.name) {
    const pConf = clamp01(raw.place.confidence)
    place = {
      name: raw.place.name,
      country: raw.place.country ?? null,
      lat: finiteOrNull(raw.place.lat),
      lng: finiteOrNull(raw.place.lng),
      confidence: pConf,
      decision: decide(pConf, thresholds),
    }
  }

  const ok = category.decision !== "none" || (place != null && place.decision !== "none")
  return { ok, provider, subject: raw?.subject ?? null, category, place }
}

// ── Request ──────────────────────────────────────────────────────────────────
export interface RecognizeRequest {
  image: string                                   // base64 (data URL o raw)
  hasGps: boolean
  context?: { lat: number; lng: number } | null   // GPS come indizio (mai usato per scrivere il luogo)
  locale?: string
  imageHash?: string
}

export function parseRequest(
  body: unknown,
): { ok: true; req: RecognizeRequest } | { ok: false; error: string } {
  const b = body as Record<string, unknown>
  if (!b || typeof b !== "object") return { ok: false, error: "invalid body" }
  if (typeof b.image !== "string" || b.image.length < 100) return { ok: false, error: "missing image" }
  if (b.image.length > 2_800_000) return { ok: false, error: "image too large" } // ~2MB base64
  const ctx = b.context as { lat?: unknown; lng?: unknown } | null | undefined
  return {
    ok: true,
    req: {
      image: b.image,
      hasGps: !!b.hasGps,
      context: ctx && typeof ctx.lat === "number" && typeof ctx.lng === "number"
        ? { lat: ctx.lat, lng: ctx.lng } : null,
      locale: typeof b.locale === "string" ? b.locale : "it",
      imageHash: typeof b.imageHash === "string" ? b.imageHash : undefined,
    },
  }
}

// Estrae base64 puro + mime da data URL o raw base64.
export function splitImage(image: string): { base64: string; mime: string } {
  const m = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s)
  return m ? { mime: m[1], base64: m[2] } : { mime: "image/jpeg", base64: image }
}
