// ─────────────────────────────────────────────────────────────────────────────
// Vision Layer — ADAPTER GEMINI FLASH (Sprint 3B, punto 1)
// UNICO file provider-specifico. Per cambiare provider (OpenAI/Claude/…) se ne
// scrive un altro con la stessa firma `recognize(input, cfg) → RawRecognition`.
// Il prompt è volutamente essenziale: l'ottimizzazione AI è un passo successivo.
// ─────────────────────────────────────────────────────────────────────────────

import { CATEGORIES, type RawRecognition } from "./core.ts"

export interface ProviderInput {
  base64: string
  mime: string
  hasGps: boolean
  context?: { lat: number; lng: number } | null
  locale: string
}

const SYSTEM = [
  "Sei un classificatore di foto di viaggio per l'app BeenThere.",
  "Analizza l'immagine e identifica il soggetto/luogo principale e la categoria più adatta.",
  `La categoria DEVE essere una di: ${CATEGORIES.filter(c => c !== "Altro").join(", ")}.`,
  "Se non sei sicuro, usa una confidence bassa. NON inventare luoghi o categorie.",
  "Compila 'place' solo se riconosci un luogo identificabile (monumento, città, sito); altrimenti null.",
].join(" ")

// Output strutturato (Gemini responseSchema) → JSON sempre valido, parsing sicuro.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", nullable: true },
    category: { type: "string", nullable: true },
    categoryConfidence: { type: "number" },
    place: {
      type: "object",
      nullable: true,
      properties: {
        name: { type: "string", nullable: true },
        country: { type: "string", nullable: true },
        lat: { type: "number", nullable: true },
        lng: { type: "number", nullable: true },
        confidence: { type: "number" },
      },
    },
  },
  required: ["categoryConfidence"],
}

export async function geminiRecognize(
  input: ProviderInput,
  cfg: { apiKey: string; model: string; signal?: AbortSignal },
): Promise<RawRecognition> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.apiKey}`
  const ctx = input.context
    ? ` Contesto GPS approssimativo: lat ${input.context.lat}, lng ${input.context.lng} (usalo solo come indizio, non come verità).`
    : ""

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{
      role: "user",
      parts: [
        { text: `Lingua delle risposte: ${input.locale}.${ctx} Analizza la foto e rispondi nello schema.` },
        { inline_data: { mime_type: input.mime, data: input.base64 } },
      ],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: cfg.signal,
  })
  if (!res.ok) throw new Error(`gemini http ${res.status}`)

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("gemini empty response")

  const p = JSON.parse(text) as Record<string, any>
  return {
    subject: p.subject ?? null,
    category: p.category ?? null,
    categoryConfidence: typeof p.categoryConfidence === "number" ? p.categoryConfidence : 0,
    place: p.place && p.place.name
      ? {
          name: p.place.name ?? null,
          country: p.place.country ?? null,
          lat: typeof p.place.lat === "number" ? p.place.lat : null,
          lng: typeof p.place.lng === "number" ? p.place.lng : null,
          confidence: typeof p.place.confidence === "number" ? p.place.confidence : 0,
        }
      : null,
  }
}
