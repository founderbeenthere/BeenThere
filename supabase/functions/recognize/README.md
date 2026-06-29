# Edge Function `recognize` — Vision Layer (Sprint 3B, punto 1)

Primo mattone del motore AI di BeenThere. Infrastruttura stabile, **provider-agnostic**,
con **degradazione silenziosa**. NON è ancora ottimizzata (prompt/UX): è la base.

## Struttura
| File | Ruolo |
|---|---|
| `core.ts` | Logica pura: enum categorie, bande confidence, validazione, normalizzazione. **Host/provider-agnostico, testabile.** |
| `gemini.ts` | **Unico** file provider-specifico (Gemini Flash). Cambiare provider = nuovo file con la stessa firma. |
| `index.ts` | Handler Deno: CORS, parsing, timeout, degradazione silenziosa. |

## Contratto
**Request** `POST` JSON:
```json
{ "image": "<base64 o data URL, compresso lato client>", "hasGps": false,
  "context": { "lat": 0, "lng": 0 } | null, "locale": "it", "imageHash": "..." }
```
**Response** (sempre 200, anche in caso di fallimento → "nessun suggerimento"):
```json
{ "ok": true, "provider": "gemini-flash", "subject": "Hagia Sophia",
  "category": { "value": "Monumenti", "confidence": 0.94, "decision": "auto" },
  "place": { "name": "...", "country": "...", "lat": null, "lng": null,
             "confidence": 0.0, "decision": "none" } }
```
Regole imposte server-side: `hasGps=true` → `place` omesso (l'AI non tocca mai il
luogo col GPS); categoria vincolata all'enum (mai inventata); `decision` ∈
`auto | verify | none` calcolata dalla confidence.

## Config (secrets / env)
| Var | Default | Note |
|---|---|---|
| `GEMINI_API_KEY` | — | **obbligatorio**. Se assente → degrada (nessun suggerimento). |
| `VISION_MODEL` | `gemini-2.0-flash` | |
| `VISION_CONF_HIGH` | `0.90` | soglia "auto" |
| `VISION_CONF_MED` | `0.90` | soglia "verify". **v1 = high → verify disattivata** (medio = niente). |
| `VISION_TIMEOUT_MS` | `4500` | timeout verso il provider |

`supabase secrets set GEMINI_API_KEY=...`

## Deploy
```
supabase functions deploy recognize --no-verify-jwt
```
`--no-verify-jwt`: il Guest non ha sessione → la funzione deve accettare richieste
anonime. Va protetta a parte (rate-limit). In `config.toml` equivale a:
```toml
[functions.recognize]
verify_jwt = false
```

## Cosa NON è in questo punto 1 (roadmap successiva)
- integrazione lato **client** (ramo Vision async in "Crea Polaroid") → punto 2/3/4;
- **telemetria** (confidence/decision/accettazione) → punto 6;
- tuning prompt e soglie su foto reali → punto 7.

## Verifica (dev-tooling — NON deployato: Supabase bundla solo il grafo di `index.ts`)
| File | Cosa verifica | Run |
|---|---|---|
| `core.test.mjs` | logica pura: bande confidence, validazione enum, omissione place con GPS, degradazione (25 assert) | `node supabase/functions/recognize/core.test.mjs` |
| `core.cases.mjs` | i 5 casi prodotto (GPS+monumento, no-GPS+monumento, foto normale, confidence bassa, errore/timeout) restano nel contratto | `node supabase/functions/recognize/core.cases.mjs` |
| `recognize-e2e.mjs` | test END-TO-END della funzione **deployata** con una foto reale (lo lanci tu dopo il deploy) | `node supabase/functions/recognize/recognize-e2e.mjs <URL> <ANON_KEY> <img> [--gps lat,lng]` |
