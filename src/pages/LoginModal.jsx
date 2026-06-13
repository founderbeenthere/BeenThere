import { useState } from 'react'

export default function LoginModal({ onClose, onSuccess, signInWithEmail }) {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const { error } = await signInWithEmail(email.trim())
    if (error) { setStatus('error'); return }
    setStatus('sent')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          position: 'relative',
          width: 320,
          background: '#f8f4ef',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid #d4c4b0',
          borderRadius: 4,
          padding: '40px 28px 28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Tape */}
        <div
          style={{
            position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 22, background: 'rgba(255,235,180,0.85)',
            border: '1px solid rgba(200,180,140,0.4)', opacity: 0.8,
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: '#9a7a58',
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}
        >×</button>

        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#3d2009', fontSize: 17, marginBottom: 8 }}>
              Controlla la tua email
            </p>
            <p style={{ fontFamily: 'sans-serif', color: '#7a5c3a', fontSize: 13, lineHeight: 1.5 }}>
              Ti abbiamo inviato un link magico a <strong>{email}</strong>.<br />
              Clicca il link per accedere e caricare la tua foto.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#3d2009', fontSize: 20, marginBottom: 6, marginTop: 0 }}>
              Accedi per caricare
            </h2>
            <p style={{ fontFamily: 'sans-serif', color: '#7a5c3a', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Inserisci la tua email — ti mandiamo un link, nessuna password.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="la tua email"
                autoFocus
                required
                style={{
                  padding: '10px 14px',
                  fontSize: 14,
                  background: '#f0e8d8',
                  border: '1px solid #c4aa84',
                  borderRadius: 3,
                  color: '#3d2009',
                  outline: 'none',
                  fontFamily: 'sans-serif',
                }}
              />
              {status === 'error' && (
                <p style={{ color: '#a05030', fontSize: 12, fontFamily: 'sans-serif', margin: 0 }}>
                  Errore nell'invio. Riprova.
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '11px',
                  background: status === 'sending' ? '#c4aa84' : '#8b5a2b',
                  border: 'none',
                  borderRadius: 3,
                  color: '#f5e6c8',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.03em',
                }}
              >
                {status === 'sending' ? 'Invio…' : 'Mandami il link ✉️'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
