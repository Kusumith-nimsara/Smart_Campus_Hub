import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('username') || 'User'
  const isApproved = localStorage.getItem('authApproved') === 'true'

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    navigate('/login', { replace: true })
  }

  return (
    <main className="unauthorized-page">
      <section className="unauthorized-card">
        <h1>{isApproved ? 'Access Denied' : 'Account Pending Approval'}</h1>
        <p className="welcome-line">Welcome, {userName}!</p>

        <div className="pending-note">
          {isApproved ? (
            'You do not have the required permissions to view this page. If you believe this is an error, please contact an administrator.'
          ) : (
            'Your account has been created but is currently awaiting approval from a system administrator. You will have limited access until your account is approved.'
          )}
        </div>

        {!isApproved && (
          <p className="pending-help">
            Once an administrator reviews and approves your account, you will gain full access to the Smart Campus application.
          </p>
        )}

        <div className="unauthorized-actions">
          {isApproved && (
            <button type="button" className="btn-modern-primary" onClick={() => navigate('/dashboard', { replace: true })} style={{ marginRight: '1rem', padding: '0.8rem 1.5rem', backgroundColor: '#34A853', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
              Go to Dashboard
            </button>
          )}
          <button type="button" className="btn-signout" onClick={handleLogout}>
            <span aria-hidden="true">↪</span>
            Sign Out
          </button>
        </div>
      </section>
    </main>
  )
}
