import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <p className="landing-badge">Smart Campus Hub</p>
        <h1>Welcome to Smart Campus Portal</h1>
        <p className="landing-subtitle">
          Continue with one Google login flow. Admin and user access are selected automatically from your email.
        </p>

        <div className="landing-actions">
          <button type="button" onClick={() => navigate('/login')}>
            Continue with Google
          </button>
        </div>
      </section>
    </main>
  )
}
