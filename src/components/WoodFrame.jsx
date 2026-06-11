export default function WoodFrame({ children }) {
  return (
    <div className="relative w-full h-full">
      {/* Outer wood border */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            ),
            linear-gradient(
              180deg,
              #6b3a1f 0%,
              #8b5a2b 15%,
              #5c3012 30%,
              #7a4a20 45%,
              #9b6535 55%,
              #6b3a1f 70%,
              #5c3012 85%,
              #7a4a20 100%
            )
          `,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6)',
        }}
      />

      {/* Inner border (cornice interna) */}
      <div
        className="absolute rounded-sm"
        style={{
          inset: '18px',
          background: `
            linear-gradient(
              180deg,
              #4a2810 0%,
              #3d2009 20%,
              #4a2810 50%,
              #3d2009 80%,
              #4a2810 100%
            )
          `,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Map area */}
        <div className="absolute inset-2 overflow-hidden rounded-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
