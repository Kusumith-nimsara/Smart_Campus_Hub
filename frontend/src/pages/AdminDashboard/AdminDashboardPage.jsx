import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboardPage.css'

function readRole() {
  return localStorage.getItem('authRole') || localStorage.getItem('role') || 'ADMIN'
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const role = useMemo(() => readRole(), [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('authRole')
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authLoginType')
    navigate('/login')
  }

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-card">
        <div className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-kicker">Smart Campus Hub</p>
            <h1>Admin Dashboard</h1>
            <p className="admin-dashboard-subtitle">Welcome back. You are logged in as an ADMIN user.</p>
          </div>
          <div className="admin-dashboard-actions">
            <button type="button" className="secondary" onClick={() => navigate('/profile')}>
              Open Profile
            </button>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          <article className="admin-widget">
            <h2>Role Access</h2>
            <p>Current role attached to this session:</p>
            <pre>{JSON.stringify({ role }, null, 2)}</pre>
          </article>

          <article className="admin-widget">
            <h2>Admin Quick Actions</h2>
            <div className="admin-widget-actions">
              <button type="button" onClick={() => navigate('/profile')}>
                Manage My Account
              </button>
              <button type="button" className="ghost" onClick={() => navigate('/')}>
                Back to Landing
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
