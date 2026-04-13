import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  {
    icon: '📅',
    title: 'Smart Booking',
    desc: 'Reserve venues, labs, and resources instantly with real-time availability.',
  },
  {
    icon: '🔧',
    title: 'Maintenance',
    desc: 'Report and track maintenance tickets from submission to resolution.',
  },
  {
    icon: '📦',
    title: 'Resources',
    desc: 'Manage campus inventory, equipment, and shared facilities effortlessly.',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    desc: 'Get AI-powered summaries and real-time campus event alerts.',
  },
]

const STATS = [
  { value: '500+', label: 'Active Users' },
  { value: '24/7', label: 'Availability' },
  { value: '50+', label: 'Campus Resources' },
  { value: '99%', label: 'Uptime' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing-page">
      {/* Animated background orbs */}
      <div className="landing-orb orb-1" />
      <div className="landing-orb orb-2" />
      <div className="landing-orb orb-3" />

      {/* Navigation bar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-logo">SC</div>
          <span>Smart Campus</span>
        </div>
        <button type="button" className="nav-login-btn" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </nav>

      {/* Hero section */}
      <section className="landing-hero">
        <div className="hero-badge">🎓 Smart Campus Hub</div>
        <h1>
          Your Campus,
          <br />
          <span className="gradient-text">Smarter Than Ever</span>
        </h1>
        <p className="hero-subtitle">
          A unified platform to manage resources, bookings, maintenance, and announcements
          — powered by AI and built for the modern campus experience.
        </p>
        <div className="hero-buttons">
          <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
            Get Started →
          </button>
          <button type="button" className="btn-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Features
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="landing-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-item">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Features grid */}
      <section id="features" className="landing-features">
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-subtitle">Powerful tools designed to simplify campus operations.</p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="landing-cta">
        <h2>Ready to get started?</h2>
        <p>Join hundreds of students and staff already using Smart Campus Hub.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/login')}>
          Sign In with Google →
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Smart Campus Hub — SLIIT PAF Project</p>
      </footer>
    </main>
  )
}
