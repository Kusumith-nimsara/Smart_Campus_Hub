import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserDashboardPage.css'

export default function UserDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading dashboard...')
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    registrationNumber: '',
    mobileNumber: '',
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
        })
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
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authLoginType')
    navigate('/login')
  }

  const first = profile.firstName || profile.username || 'User'
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || 'Campus User'
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <main className="user-dashboard-page">
      <aside className="user-sidebar">
        <div className="brand-mark">SC</div>
        <h2>Smart Campus</h2>

        <p className="sidebar-user-label">Logged in as</p>
        <p className="sidebar-user-name">{fullName}</p>
        <p className="sidebar-user-role">USER</p>

        <nav className="sidebar-menu" aria-label="Dashboard Menu">
          <button type="button" className="active">Dashboard</button>
          <button type="button" onClick={() => navigate('/profile')}>Profile</button>
          <button type="button">Notifications</button>
          <button type="button">Resources</button>
          <button type="button">Bookings</button>
          <button type="button">Tickets</button>
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <section className="user-content">
        <header className="user-topbar">
          <div>
            <h1>Welcome back, {first}!</h1>
            <p>{today}</p>
          </div>
          <button type="button" className="user-top-action" onClick={() => navigate('/')}>
            Back to Landing
          </button>
        </header>

        <div className="stats-grid">
          <article className="stat-card">
            <h3>Account Status</h3>
            <p>ACTIVE</p>
          </article>
          <article className="stat-card">
            <h3>User Type</h3>
            <p>STUDENT</p>
          </article>
          <article className="stat-card">
            <h3>Role</h3>
            <p>USER</p>
          </article>
          <article className="stat-card">
            <h3>Last Updated</h3>
            <p>{today}</p>
          </article>
        </div>

        <div className="dashboard-widgets">
          <article className="widget profile-summary">
            <h2>Your Profile</h2>
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
              Edit Profile
            </button>
          </article>

          <article className="widget notifications">
            <h2>Notifications</h2>
            <p className="widget-note">No new notifications</p>
            <button type="button" className="link-btn">View All</button>
          </article>

          <article className="widget quick-links">
            <h2>Quick Links</h2>
            <button type="button">Resources</button>
            <button type="button">Bookings</button>
            <button type="button">Tickets</button>
          </article>
        </div>

        <p className="dashboard-status">{message}</p>
      </section>
    </main>
  )
}
