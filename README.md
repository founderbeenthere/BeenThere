# BeenThere! 📍

**Your travel. Your map. Your wall.**

BeenThere turns your travel photos into polaroids pinned on a wooden world map —
a living gallery of everywhere you've been. Upload a photo and, in seconds, it
becomes a memory placed exactly where it happened.

> Make it happen. Make it real.

## Vision

Physical travel maps on a wall are beautiful but static. BeenThere brings that
feeling to a living, personal digital wall: every trip becomes a polaroid on your
own world map, remembered where it happened — effortless, private, and yours.

## What it does

- 📸 **Upload or snap a photo** — no sign-up required to start.
- 🗺️ **Automatic placement** — GPS pins the memory when available; an AI Vision
  layer recognizes the subject and suggests place & category when GPS is missing.
- 🖼️ **Instant polaroid** — the photo becomes a polaroid on your wooden world map,
  with a WOW moment and a micro-celebration.
- ✨ **Explore your wall** — zoom, pan and revisit your memories; share or (soon)
  print your wall.

Privacy-first: guest memories live on the device by default; the AI never blocks
the flow and never overrides a manual choice.

## Status

🚧 **Early prototype — private beta preparation.**
The core guest experience (upload → polaroid → map → celebration) and the AI
Vision layer are live and tested on real devices. Accounts, cloud sync and
sharing are in progress.

## Live demo

- App: **https://www.beenthere.photos** — open `/try` to start
- Dedicated page: https://www.beenthere.photos/liquid-factory

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 19 · Vite · Tailwind CSS |
| Backend   | Supabase — Postgres · Auth (magic link) · Storage · Edge Functions (Deno) |
| AI Vision | Google Gemini (`gemini-2.5-flash`) via a provider-agnostic adapter |
| Hosting   | Vercel |

**Architecture principles**

- *The user never waits for AI* — Vision runs in the background, degrades
  silently, and never blocks the experience.
- *GPS = where, AI = what* — location comes from GPS, subject/category from
  Vision; manual input always wins.

## Roadmap

- [ ] Telemetry + confidence/prompt tuning on real photos
- [ ] Sharing (wall link + social)
- [ ] Accounts & cloud sync
- [ ] Print / high-res poster export

## Local development

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev                  # append -- --host to test on a phone over the LAN
```

Build and lint:

```bash
npm run build
npm run lint
```

See [`CLAUDE.md`](./CLAUDE.md) for architecture, conventions and workflows.

## Development note

BeenThere is built with an AI-assisted development workflow (Claude Code)
together with the founder.

---

© 2026 BeenThere!
