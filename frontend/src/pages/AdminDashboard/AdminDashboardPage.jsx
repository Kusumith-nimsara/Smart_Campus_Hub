import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || ''
  const adminName = localStorage.getItem('username') || 'Admin User'
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [processingUserId, setProcessingUserId] = useState('')
  const [statusMessage, setStatusMessage] = useState('Loading users...')

  useEffect(() => {
    async function loadUsers() {
      if (!token) {
        setStatusMessage('Missing token. Please login again.')
        setLoadingUsers(false)
        return
      }

      try {
        const response = await fetch(`${backendBaseUrl}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? 'Failed to load users.')
        }

        const normalized = Array.isArray(data) ? data : []
        setUsers(normalized)
        setStatusMessage('Users loaded.')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load users.'
        setStatusMessage(errorMessage)
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [backendBaseUrl, token])

  async function handleApproveUser(userId) {
    setProcessingUserId(userId)
    setStatusMessage('Approving user...')

    try {
      const response = await fetch(`${backendBaseUrl}/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to approve user.')
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? data : user)))
      setStatusMessage('User approved successfully.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve user.'
      setStatusMessage(errorMessage)
    } finally {
      setProcessingUserId('')
    }
  }

  const pendingUsers = users.filter((user) => !user?.approved)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('authRole')
    localStorage.removeItem('authApproved')
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authLoginType')
    navigate('/login')
  }

  return (
    <main className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">SC</div>
          <h2>Smart Campus</h2>
        </div>

        <div className="admin-identity">
          <p className="label">Logged in as</p>
          <p className="name">{adminName}</p>
          <p className="role">ADMIN</p>
        </div>

        <nav className="admin-nav" aria-label="Admin Dashboard Navigation">
          <button type="button" className="active">Dashboard</button>
          <button type="button" onClick={() => navigate('/profile')}>Profile</button>
          <button type="button">Notifications</button>
          <button type="button">Resources</button>
          <button type="button">Bookings</button>
          <button type="button">Tickets</button>
          <button type="button">User Management</button>
        </nav>

        <button type="button" className="admin-logout" onClick={handleLogout}>Logout</button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Welcome to Smart Campus</h1>
            <p>{today}</p>
          </div>
          <button type="button" className="back-btn" onClick={() => navigate('/')}>
            Back to Landing
          </button>
        </header>

        <section className="admin-stats-grid">
          <article className="stat-card account">
            <h3>Your Account</h3>
            <p className="primary">{adminName}</p>
            <p className="secondary">{localStorage.getItem('username') || 'admin@smartcampus'}</p>
          </article>
          <article className="stat-card role-card">
            <h3>Your Role</h3>
            <p className="primary">ADMIN</p>
            <p className="secondary">System Control</p>
          </article>
          <article className="stat-card status">
            <h3>Status</h3>
            <p className="primary">Account Active</p>
            <p className="secondary">Secure Session</p>
          </article>
        </section>

        <section className="admin-panel features">
          <h2>Features Overview</h2>
          <div className="feature-grid">
            <article className="feature-item resources">
              <h4>Resources</h4>
              <p>Manage campus resources and labs</p>
            </article>
            <article className="feature-item bookings">
              <h4>Bookings</h4>
              <p>Schedule facilities and approvals</p>
            </article>
            <article className="feature-item tickets">
              <h4>Tickets</h4>
              <p>Track support and maintenance issues</p>
            </article>
            <article className="feature-item notifications">
              <h4>Notifications</h4>
              <p>Broadcast updates to campus users</p>
            </article>
          </div>
        </section>

        <section className="admin-bottom-grid">
          <article className="admin-panel quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <button type="button" onClick={() => navigate('/profile')}>Manage Profile</button>
              <button type="button">View Resources</button>
              <button type="button">Create Booking</button>
              <button type="button">Open Tickets</button>
            </div>
          </article>

          <article className="admin-panel pending-widget">
            <h2>Pending Approvals</h2>
            {loadingUsers ? (
              <p className="admin-muted">Loading users...</p>
            ) : pendingUsers.length === 0 ? (
              <p className="admin-muted">No pending user accounts.</p>
            ) : (
              <div className="pending-list">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="pending-item">
                    <div>
                      <p className="pending-name">{user.firstName || user.username || 'User'}</p>
                      <p className="pending-email">{user.email || 'No email'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApproveUser(user.id)}
                      disabled={processingUserId === user.id}
                    >
                      {processingUserId === user.id ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <p className="admin-status">{statusMessage}</p>
      </section>
    </main>
  )
}
