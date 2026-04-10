import { useNavigate } from 'react-router-dom'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <main className="unauthorized-page">
      <section className="unauthorized-card">
        <p className="unauthorized-code">403</p>
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>

        <div className="unauthorized-actions">
          <button type="button" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button type="button" className="secondary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </section>
    </main>
  )
}
