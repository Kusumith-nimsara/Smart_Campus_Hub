import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'
import './UserDashboardPage.css'

export default function UserDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
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
      } catch {
        // Keep dashboard layout available even when profile fetch fails.
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [backendBaseUrl, token])

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const first = profile.firstName || profile.username || 'User'
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || 'Campus User'
  const displayRole = profile.role || localStorage.getItem('authRole') || 'USER'
  const googleAvatarCandidate =
    googleAvatarUrl ||
    (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')
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
          <button type="button" className="active" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          <button type="button" onClick={() => navigate('/profile')}>👤 Profile</button>
          <button type="button" onClick={() => navigate('/notifications')}>🔔 Notifications</button>
          <button type="button" onClick={() => navigate('/catalogue')}>📚 Catalogue</button>
          <button type="button" onClick={() => navigate('/tickets')}>🎫 Tickets</button>
          <button type="button" onClick={() => navigate('/bookings')}>📅 Bookings</button>
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
            <div className="user-account-menu">
              <button
                type="button"
                className="user-account-trigger"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
              >
                <div className="user-topbar-user">
                  <span>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={fullName}
                        className="user-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (fullName || first).charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="user-topbar-uname">{fullName}</p>
                    <p className="user-topbar-urole">
                      {displayRole}
                      {isGoogleLogin && (
                        <span className="user-login-provider" aria-label="Signed in with Google">
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.8 2.6 12s4.2 9.5 9.4 9.5c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z"/>
                            <path fill="#34A853" d="M3.7 7.6l3.2 2.3c.9-1.8 2.8-3 5.1-3 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 8.4 2.5 5.3 4.6 3.7 7.6z"/>
                            <path fill="#4A90E2" d="M12 21.5c2.5 0 4.7-.8 6.3-2.2l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.8 0-5.2-2.5-5.4-3.8l-3.2 2.5c1.6 3 4.7 4.8 8.6 4.8z"/>
                            <path fill="#FBBC05" d="M3.7 16.7l3.2-2.5c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L3.7 7.6C3 8.9 2.6 10.4 2.6 12s.4 3.1 1.1 4.7z"/>
                          </svg>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="user-account-dropdown" role="menu" aria-label="Account actions">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
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
      </section>
    </main>
  )
}
