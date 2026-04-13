import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('username') || 'User'

  function handleLogout() {
    clearAuthState()
    navigate('/login', { replace: true })
  }

  return (
    <main className="unauthorized-page">
      <section className="unauthorized-card">
        <h1>Account Pending Approval</h1>
        <p className="welcome-line">Welcome, {userName}!</p>

        <div className="pending-note">
          Your account has been created but is currently awaiting approval from a system administrator.
          You will have limited access until your account is approved.
        </div>

        <p className="pending-help">
          Once an administrator reviews and approves your account, you will gain full access to the Smart Campus application.
        </p>

        <div className="unauthorized-actions">
          <button type="button" className="btn-signout" onClick={handleLogout}>
            <span aria-hidden="true">↪</span>
            Sign Out
          </button>
        </div>
      </section>
    </main>
  )
}
