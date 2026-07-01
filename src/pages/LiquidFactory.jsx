// ─────────────────────────────────────────────────────────────────────────────
// /liquid-factory — pagina "404 / coming soon" dedicata a The Liquid Factory.
// Mostra l'ARTWORK FINALE a piena pagina (853×1844), non ritagliato, con la
// stessa tecnica della landing /try (img width:100% + aspectRatio nativo).
// Auto-contenuta: nessun Supabase, nessuna auth, nessuna dipendenza nuova.
// Sorgente artwork: "Liquid Factory 404 Landing Page.png" (Daniele) →
// copiato in public/assets/liquid-factory-404.png. Per aggiornarlo: sostituisci
// quel file (stesso nome), nessuna modifica al codice.
// ─────────────────────────────────────────────────────────────────────────────

// cream allineato al bordo dell'artwork (rgb 249,244,236) → nessuna cucitura
// visibile tra l'immagine e la banda con la dedica.
const CREAM = '#f9f4ec'

export default function LiquidFactory() {
  return (
    <div style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: CREAM }}>
      {/* colonna centrata (mobile-first): su desktop resta larga come un telefono */}
      <div style={{ maxWidth: 460, margin: '0 auto', background: CREAM }}>
        <img
          src="/assets/liquid-factory-404.png"
          alt="BeenThere — Welcome, Liquid Factory. Coming soon."
          width={853}
          height={1844}
          style={{ width: '100%', height: 'auto', aspectRatio: '853 / 1844', display: 'block' }}
          draggable={false}
        />

        {/* Dedica personale — peso visivo basso, tono intenzionale (non promozionale) */}
        <div style={{ textAlign: 'center', padding: '14px 20px 24px' }}>
          <span style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: 12, color: '#a08c6e', letterSpacing: '0.01em',
          }}>
            Created for The Liquid Factory Batch 2026
          </span>
        </div>
      </div>
    </div>
  )
}
