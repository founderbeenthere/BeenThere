export default function Sidebar({ trips, loading }) {
  const sortedTrips = [...trips].sort((a, b) =>
    new Date(b.visit_date || 0) - new Date(a.visit_date || 0)
  )

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: '220px',
        minWidth: '220px',
        background: 'linear-gradient(180deg, #5c3012 0%, #3d2009 100%)',
        borderRight: '2px solid #2a1205',
        boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: '#2a1205' }}
      >
        <h1
          className="text-xl font-bold leading-tight"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#f5e6c8',
            letterSpacing: '0.02em',
          }}
        >
          Been
          <span style={{ color: '#d4a574' }}>There</span>
        </h1>
        <p className="text-xs mt-1" style={{ color: '#a08060' }}>
          La tua mappa di viaggio
        </p>
      </div>

      {/* Stats */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: '#2a1205', background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: '#a08060' }}>Luoghi visitati</span>
          <span
            className="text-lg font-bold"
            style={{ color: '#d4a574', fontFamily: "'Playfair Display', serif" }}
          >
            {trips.length}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="px-4 py-3 border-b text-xs"
        style={{ borderColor: '#2a1205', color: '#9a7a58' }}
      >
        <p>Clicca sulla mappa per aggiungere un luogo</p>
      </div>

      {/* Trip list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {loading && (
          <div className="text-center py-4 text-xs" style={{ color: '#7a5c3a' }}>
            Caricamento...
          </div>
        )}
        {!loading && trips.length === 0 && (
          <div className="text-center py-6 text-xs" style={{ color: '#7a5c3a' }}>
            Nessun viaggio ancora.<br />Inizia cliccando sulla mappa!
          </div>
        )}
        {sortedTrips.map(trip => (
          <div
            key={trip.id}
            className="flex items-center gap-2 px-2 py-2 rounded-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(212,165,116,0.15)',
            }}
          >
            <span className="text-base flex-shrink-0">{trip.emoji || '📍'}</span>
            <div className="overflow-hidden">
              <div
                className="text-xs font-medium truncate"
                style={{ color: '#f0dcc0' }}
              >
                {trip.place_name}
              </div>
              {trip.visit_date && (
                <div className="text-xs" style={{ color: '#8a6a48' }}>
                  {new Date(trip.visit_date).toLocaleDateString('it-IT', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
