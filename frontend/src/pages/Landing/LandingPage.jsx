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
          Choose how you want to continue: student login, admin login, or create a new account.
        </p>

        <div className="landing-actions">
          <button type="button" onClick={() => navigate('/login')}>
            User Login
          </button>
          <button type="button" className="secondary" onClick={() => navigate('/admin-login')}>
            Admin Login
          </button>
          <button type="button" className="ghost" onClick={() => navigate('/register')}>
            Register
          </button>
          <button type="button" className="ghost" onClick={() => navigate('/profile')}>
            Edit Profile
          </button>
        </div>
      </section>
    </main>
  )
}
