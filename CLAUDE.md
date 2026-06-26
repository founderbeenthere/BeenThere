\# BeenThere! - Contesto progetto per Claude Code



Questo file viene letto automaticamente all'avvio di ogni sessione di Claude Code.

Tienilo aggiornato: basta modificare la sezione "STATO ATTUALE" a fine sessione.



====================================================



\## STATO ATTUALE (aggiornare a fine sessione)



\- Ultimo aggiornamento: 26/06/2026

\- Branch: master

\- Avanzamento verso alpha privata: \~65-70%

\- Lavoro in corso recente: cleanup TryPage + TryCreatePolaroid (gia committato).

&#x20; Prima di toccare codice: lancia "git log --oneline -20" e "git status".

&#x20; La verita e il codice + la cronologia git, non questo documento.

\- Prossimo passo immediato: (scrivere qui cosa fare oggi, es. Sprint 3 GPS

&#x20; reverse geocode oppure Sprint 4 crop canvas reale)



====================================================



\## Cos e BeenThere!



App web di memorie di viaggio: trasforma le foto di viaggio in polaroid

appuntate su una mappa del mondo in legno. Ispirata alla mappa di legno fisica

appesa al muro del fondatore.

\- Claim: "Your travel. Your map. Your wall."

\- Motto interno: "Make it happen. Make it real."



\## Stack tecnico



\- Frontend: React + Vite + Tailwind CSS

\- Backend / DB / Auth / Storage: Supabase (istanza EU Ireland: rdtabkgczciwexphmefm)

\- Hosting: Vercel

\- Repo: founderbeenthere/BeenThere (branch principale: master)

\- Dominio live: beenthere.photos



\## Architettura / componenti chiave



\- Componenti: WoodFrame, WorldMap, Polaroid, Sidebar, AddTripModal

\- Hook: useTrips

\- Route /try = landing page del QR code

&#x20; (asset: public/assets/BeenThere\_QR\_try\_v1\_OFFICIAL.svg.svg)



\## Dati (Supabase)



Tabella trips: id, user\_id, place\_name, lat, lng, visit\_date, emoji,

photo\_url, note, trip\_type, created\_at. RLS attiva.

\- Auth: Magic Link

\- Storage: upload foto con compressione

\- GPS: calibrazione via regressione di Mercatore su 14 citta di riferimento



\## Decisioni di prodotto bloccate



\- Le polaroid mantengono orientamento e proporzioni originali della foto

\- Funnel guest: scan QR -> upload foto immediato -> effetto wow -> invito a

&#x20; salvare / registrarsi

\- Logo: Playfair Display, con un pin di sughero dorato al posto del punto esclamativo

\- Documento strategico canonico: Documento Fondativo V3 (14/06/2026)



\## Sprint / bottleneck aperti



\- Sprint 3: GPS reverse geocode (bottleneck aperto)

\- Sprint 4: crop foto reale basato su canvas (sostituire il fake crop CSS attuale)



\## Convenzioni di lavoro



\- Daniele e il fondatore solo, italiano -> rispondere in italiano, diretto,

&#x20; con comandi copia-incolla singoli quando possibile.

\- Mantra anti-feature-creep: "Torna al camino". Se spunta una feature non

&#x20; essenziale, fermarsi.

\- Due macchine:

&#x20; PC (PRINC)    -> C:\\Users\\PRINC\\BeenThere

&#x20; Laptop (epicm) -> C:\\Users\\epicm\\Documents\\BeenThere

\- Regola d oro: prima di modificare codice, leggere git log e i file rilevanti

&#x20; per verificare lo stato reale.



\## Comandi utili



\- Dev server: npm run dev

\- Build: npm run build

\- (verificare package.json per gli script esatti)

