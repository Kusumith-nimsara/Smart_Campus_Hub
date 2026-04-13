import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserDashboardPage.css'

export default function UserDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading dashboard...')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    registrationNumber: '',
    mobileNumber: '',
    role: '',
    userType: '',
    suspended: false,
  })

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setMessage('No session found. Please login.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${backendBaseUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? 'Failed to load dashboard data.')
        }

        setProfile({
          username: data?.username ?? '',
          email: data?.email ?? '',
          firstName: data?.firstName ?? '',
          lastName: data?.lastName ?? '',
          registrationNumber: data?.registrationNumber ?? '',
          mobileNumber: data?.mobileNumber ?? '',
          role: data?.role ?? '',
          userType: data?.userType ?? '',
          suspended: data?.suspended ?? false,
        })
        if (typeof data?.role === 'string') {
          localStorage.setItem('role', data.role.toUpperCase())
          localStorage.setItem('authRole', data.role.toUpperCase())
        }
        if (typeof data?.approved === 'boolean') {
          localStorage.setItem('authApproved', String(data.approved))
        }
        setMessage('Dashboard ready.')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data.'
        setMessage(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [backendBaseUrl, token])

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

  const first = profile.firstName || profile.username || 'User'
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || 'Campus User'
  const displayRole = profile.role || localStorage.getItem('authRole') || 'USER'
  const displayUserType = profile.userType || 'STUDENT'
  const accountStatus = profile.suspended ? 'SUSPENDED' : 'ACTIVE'
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <main className={`user-dashboard-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <aside className="user-sidebar" aria-hidden={!isSidebarOpen}>
        <div className="brand-mark">SC</div>
        <h2>Smart Campus</h2>

        <p className="sidebar-user-label">Logged in as</p>
        <p className="sidebar-user-name">{fullName}</p>
        <p className="sidebar-user-role">{displayRole}</p>

        <nav className="sidebar-menu" aria-label="Dashboard Menu">
          <button type="button" className="active">📊 Dashboard</button>
          <button type="button" onClick={() => navigate('/profile')}>👤 Profile</button>
          <button type="button">🔔 Notifications</button>
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <section className="user-content">
        <header className="user-topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              type="button" 
              className="sidebar-toggle-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
            <div>
              <h1>Welcome back, {first}! 👋</h1>
              <p>{today}</p>
            </div>
          </div>
          <div className="topbar-right">
            <button type="button" className="user-top-action" onClick={() => navigate('/')}>
              ← Back to Landing
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <article className="stat-card">
            <h3>Account Status</h3>
            <p>{accountStatus}</p>
          </article>
          <article className="stat-card">
            <h3>User Type</h3>
            <p>{displayUserType}</p>
          </article>
          <article className="stat-card">
            <h3>Role</h3>
            <p>{displayRole}</p>
          </article>
          <article className="stat-card">
            <h3>Last Updated</h3>
            <p>{today}</p>
          </article>
        </div>

        <div className="dashboard-widgets">
          <article className="widget profile-summary">
            <h2>📋 Your Profile</h2>
            {loading ? (
              <p className="widget-note">Loading...</p>
            ) : (
              <div className="summary-grid">
                <p><span>Email</span>{profile.email || '-'}</p>
                <p><span>Full Name</span>{fullName}</p>
                <p><span>Registration No</span>{profile.registrationNumber || '-'}</p>
                <p><span>Mobile</span>{profile.mobileNumber || '-'}</p>
              </div>
            )}
            <button type="button" className="link-btn" onClick={() => navigate('/profile')}>
              Edit Profile →
            </button>
          </article>

          <article className="widget notifications">
            <h2>🔔 Notifications</h2>
            <p className="widget-note">No new notifications</p>
            <button type="button" className="link-btn">View All →</button>
          </article>

          <article className="widget quick-links">
            <h2>⚡ Quick Links</h2>
            <button type="button" onClick={() => navigate('/profile')}>👤 Edit Profile</button>
            <button type="button" onClick={() => navigate('/')}>🏠 Landing Page</button>
          </article>
        </div>

        <p className="dashboard-status">{message}</p>
      </section>
    </main>
  )
}
