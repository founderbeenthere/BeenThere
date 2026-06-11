import { useState } from 'react'

const MENU_ITEMS = [
  { icon: '📸', label: 'Upload photos' },
  { icon: '🗺️', label: 'My map' },
  { icon: '⬇️', label: 'Download wallpaper' },
  { icon: '👤', label: 'Account' },
  { icon: '❓', label: 'How it works' },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed top-4 right-4 z-50 flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label="Menu"
      >
        <span
          style={{
            display: 'block', width: '24px', height: '2px',
            background: '#3B1F0A',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg) translate(3px, 3px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block', width: '24px', height: '2px',
            background: '#3B1F0A',
            opacity: open ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        />
        <span
          style={{
            display: 'block', width: '24px', height: '2px',
            background: '#3B1F0A',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
          }}
        />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side panel */}
      <div
        className="fixed top-0 right-0 h-full z-40 flex flex-col"
        style={{
          width: '260px',
          background: '#3B1F0A',
          color: '#F5EDE0',
          padding: '24px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="mt-10 mb-8">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              color: '#F5EDE0',
              letterSpacing: '0.02em',
            }}
          >
            Been<span style={{ color: '#C87828' }}>There!</span>
          </h2>
        </div>

        <nav className="flex flex-col gap-1">
          {MENU_ITEMS.map(item => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-3 py-3 rounded text-left w-full"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F5EDE0',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setOpen(false)}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
