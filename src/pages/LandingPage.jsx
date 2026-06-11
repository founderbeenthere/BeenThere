import { useNavigate } from 'react-router-dom'

const STEPS = [
  { n: '01', title: 'Upload a photo',    desc: 'Snap or pick any travel shot from your camera roll.' },
  { n: '02', title: 'We find the place', desc: 'AI reads the image and pins it to the right spot on the map.' },
  { n: '03', title: 'Your moment',       desc: 'A polaroid lands on the wall — exactly where you were.' },
  { n: '04', title: 'Build your wall',   desc: 'Add more trips. Watch your personal travel gallery grow.' },
  { n: '05', title: 'Save & relive',     desc: 'Revisit your wall any time. Print it. Share it.' },
]

const BENEFITS = [
  { icon: '🔓', title: 'No sign up',      desc: 'Start instantly — no account needed.' },
  { icon: '🔒', title: 'Private',          desc: 'Your wall lives on your device by default.' },
  { icon: '🔗', title: 'Share your wall', desc: 'Generate a link and show the world. (coming soon)' },
  { icon: '🖨️', title: 'Print your wall', desc: 'Export as a high-res poster. (coming soon)' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5EDE0',
        fontFamily: "'Playfair Display', serif",
        overflowX: 'hidden',
      }}
    >
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '60vh',
          minHeight: 380,
          background: '#2a1205',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/HERO_LANDING_PAGE.jpeg"
          alt="BeenThere travel wall"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.85,
          }}
          onError={e => { e.currentTarget.style.opacity = '0' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(26,13,4,0) 40%, rgba(26,13,4,0.88) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: '0 40px 48px', maxWidth: 640 }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#F5EDE0',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}
          >
            Your travels.<br />Your map.<br />Your wall.
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 17px)',
              color: '#C8A87A',
              margin: 0,
              fontFamily: 'sans-serif',
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Turn your photos into a living travel map in seconds.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '64px 32px 56px', maxWidth: 1080, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9a7a58',
            marginBottom: 32,
            fontFamily: 'sans-serif',
            fontWeight: 600,
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {STEPS.map(step => (
            <div
              key={step.n}
              style={{
                flex: '0 0 auto',
                width: 176,
                padding: '24px 18px',
                background: '#fff',
                border: '1px solid #e0d0bc',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#E8A050',
                  fontFamily: 'sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  marginBottom: 12,
                }}
              >
                {step.n}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#2a1205',
                  marginBottom: 8,
                  lineHeight: 1.25,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#7a5a38',
                  fontFamily: 'sans-serif',
                  lineHeight: 1.55,
                }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section
        style={{
          background: '#ede4d6',
          padding: '48px 32px 56px',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9a7a58',
              marginBottom: 32,
              fontFamily: 'sans-serif',
              fontWeight: 600,
            }}
          >
            Why BeenThere
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
            }}
          >
            {BENEFITS.map(b => (
              <div
                key={b.title}
                style={{
                  padding: '20px',
                  background: '#fff',
                  border: '1px solid #e0d0bc',
                  borderRadius: 4,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 10 }}>{b.icon}</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#2a1205',
                    marginBottom: 6,
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#7a5a38',
                    fontFamily: 'sans-serif',
                    lineHeight: 1.55,
                  }}
                >
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          textAlign: 'center',
          padding: '56px 32px 80px',
          background: '#F5EDE0',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '16px 52px',
            background: '#E8A050',
            border: 'none',
            borderRadius: 3,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.02em',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,160,80,0.35)',
          }}
        >
          Start your map
        </button>
        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            color: '#9a7a58',
            fontFamily: 'sans-serif',
          }}
        >
          No sign up required. Free.
        </p>
      </section>
    </div>
  )
}
