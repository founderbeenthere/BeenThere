# BeenThere — Engineering Guide

Technical reference for AI assistants and contributors working on the BeenThere
codebase: architecture, conventions, and workflows. Product overview and demo
links live in [`README.md`](./README.md).

## Overview

BeenThere turns travel photos into polaroids pinned on a wooden world map. A
guest can start with no account: upload a photo → it becomes a polaroid → it is
placed on the map (via GPS, or via an AI Vision layer when GPS is missing) → WOW
moment → wall.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, react-router v7
- **Backend:** Supabase — Postgres, Auth (magic link), Storage, Edge Functions (Deno)
- **AI Vision:** Google Gemini (`gemini-2.5-flash`) behind a provider-agnostic adapter
- **Hosting:** Vercel (SPA rewrite in `vercel.json`)

## Repository layout

```
src/
  pages/        # route screens (TryPage, MapPage, LandingPage, LiquidFactory, LoginModal…)
  components/   # UI (WorldMap, GuestWall, Polaroid, MicroCelebration, WowMoment, ShareSheet…)
  hooks/        # useTrips (auth), useGuestTrips (localStorage), useAuth
  utils/        # geo.js (lat/lng ↔ map %), image helpers
  lib/          # supabase.js, vision.js (Vision transport)
supabase/functions/recognize/   # Vision Edge Function (core.ts, gemini.ts, index.ts) + tests
public/assets/  # only assets served by the app
design/         # design archive (concepts, references, mockups) — not shipped
```

## Core architecture

### Guest vs authenticated
- **Guest** (no session): memories live in `localStorage` (`beenthere_guest_trips`)
  via `useGuestTrips`; limit `GUEST_LIMIT` (3); entry route is `/try`.
- **Authenticated:** `useTrips` + Supabase (`trips` table, RLS enabled).

Guest trip shape: `{ id, place_name, lat, lng, visit_date, category, photo_src, emoji, created_at }`.

### Map projection
`utils/geo.js` — `geoToPercent(lat,lng)` / `percentToGeo()`. Mercator projection
fitted by least-squares regression over 14 reference cities, calibrated on the
wooden-map artwork. Never hardcode pin positions; always derive them from lat/lng.

### AI Vision layer
- Client `lib/vision.js` compresses the image (≤768px) and calls the `recognize`
  Edge Function; it returns the normalized contract or `null` — **no AI logic on
  the client**.
- Edge Function `supabase/functions/recognize/`: `core.ts` (pure logic + contract),
  `gemini.ts` (the only provider-specific file), `index.ts` (Deno handler with
  timeout and silent degradation). Model via `VISION_MODEL` (default `gemini-2.5-flash`).

Founding principles (must not be violated):
1. **The user never waits for AI.** Vision runs in the background, has a timeout
   (server 9s / client 12s), aborts on unmount, and degrades silently to the
   working manual flow. Never block the UI; never surface an AI error.
2. **GPS = where, AI = what.** GPS owns place/coords; Vision suggests subject +
   category. When GPS is present the server omits `place`.
3. **Manual always wins.** Source-priority — category: `manual > vision >
   geocoding > default`; place: `manual > gps > vision`. Never override a manual
   choice.
4. **AI never invents.** Categories are validated against the app enum; confidence
   bands (`auto` / `verify` / `none`) gate every suggestion; low confidence → nothing.

## Conventions

- Styling: inline styles + Tailwind, consistent with existing components. Palette:
  cream `#f0ebe0`, wood browns, gold `#E8A050`; fonts Playfair Display + Caveat.
- Mobile-first — verify at 412×869 and on desktop.
- Keep the provider-agnostic seam intact; avoid new dependencies unless necessary.
- `public/assets/` holds only shipped assets; design material belongs in `design/`.

## Workflows

```bash
npm install
cp .env.example .env.local        # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                        # append -- --host to expose on the LAN
npm run build && npm run lint
```

Edge Function deploy (Supabase CLI — secrets never committed):

```bash
supabase secrets set GEMINI_API_KEY=... --project-ref <ref>
supabase functions deploy recognize --no-verify-jwt --project-ref <ref>
```

App deploy: push to `master` → Vercel builds and deploys.

## Guardrails

- Secrets live only in `.env.local` (gitignored) and Supabase secrets — never in
  the repository.
- Before changing behavior, read `git log` and the relevant files: the code and
  history are the source of truth.
