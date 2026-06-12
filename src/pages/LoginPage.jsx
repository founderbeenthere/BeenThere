import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithEmail } = useAuth()
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setErrMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#2a1205',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Playfair Display', serif",
      }}
    >
      {/* Background map faint */}
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundImage: "url('/assets/HERO_UPDATED_TRAVEL_WALL_CONCEPT_9_16_LUCE_NOTTURNA_CALDA.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          margin: '0 24px',
          background: '#f8f4ef',
          border: '1px solid #d4c4b0',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          padding: '40px 32px 36px',
        }}
      >
        {/* Tape decoration */}
        <div
          style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            width: 72, height: 20,
            background: 'rgba(255,235,180,0.85)',
            border: '1px solid rgba(200,180,140,0.4)',
          }}
        />

        <h1
          style={{
            textAlign: 'center',
            fontSize: 26,
            fontWeight: 700,
            color: '#3d2009',
            margin: '0 0 6px',
          }}
        >
          BeenThere
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: '#9a7a58',
            margin: '0 0 32px',
            fontFamily: 'sans-serif',
          }}
        >
          La tua mappa di viaggi personale
        </p>

        {status === 'sent' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <p style={{ color: '#3d2009', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              Controlla la tua email
            </p>
            <p style={{ color: '#7a5c3a', fontSize: 13, fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              Ti abbiamo inviato un link magico a<br />
              <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                style={{ display: 'block', fontSize: 11, color: '#7a5c3a', marginBottom: 6, letterSpacing: '0.05em' }}
              >
                EMAIL
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="la.tua@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus('idle') }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 14,
                  background: '#f0e8d8',
                  border: `1px solid ${status === 'error' ? '#c07050' : '#c4aa84'}`,
                  borderRadius: 3,
                  color: '#3d2009',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'sans-serif',
                }}
              />
              {status === 'error' && (
                <p style={{ fontSize: 12, color: '#c07050', marginTop: 6, fontFamily: 'sans-serif' }}>
                  {errMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%',
                padding: '12px',
                background: status === 'sending' ? '#c4aa84' : '#8b5a2b',
                border: 'none',
                borderRadius: 3,
                color: '#f5e6c8',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Playfair Display', serif",
                cursor: status === 'sending' ? 'wait' : 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              {status === 'sending' ? 'Invio in corso…' : 'Mandami il link'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#9a7a58', fontFamily: 'sans-serif', margin: 0 }}>
              Nessuna password. Solo un link via email.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
