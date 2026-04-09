import './LandingPage.css'

export default function LandingPage({ onNavigate }) {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <p className="landing-badge">Smart Campus Hub</p>
        <h1>Welcome to Smart Campus Portal</h1>
        <p className="landing-subtitle">
          Choose how you want to continue: student login, admin login, or create a new account.
        </p>

        <div className="landing-actions">
          <button type="button" onClick={() => onNavigate('login')}>
            User Login
          </button>
          <button type="button" className="secondary" onClick={() => onNavigate('admin')}>
            Admin Login
          </button>
          <button type="button" className="ghost" onClick={() => onNavigate('register')}>
            Register
          </button>
        </div>
      </section>
    </main>
  )
}
