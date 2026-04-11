import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || ''

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
          <article className="admin-widget pending-widget">
            <h2>Pending Approvals</h2>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : pendingUsers.length === 0 ? (
              <p>No pending user accounts.</p>
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

        <p className="admin-status">{statusMessage}</p>
      </section>
    </main>
  )
}
