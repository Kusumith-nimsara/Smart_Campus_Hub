import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboardPage.css'

function readRoles() {
  try {
    const raw = localStorage.getItem('authRoles')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const roles = useMemo(() => readRoles(), [])

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authRoles')
    localStorage.removeItem('authLoginType')
    navigate('/admin-login')
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
            <p>Current roles attached to this session:</p>
            <pre>{JSON.stringify(roles, null, 2)}</pre>
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
