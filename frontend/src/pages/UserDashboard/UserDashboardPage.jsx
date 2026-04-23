import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import './UserDashboardPage.css'
import { useSidebar } from '../../contexts/SidebarContext'

export default function UserDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [loading, setLoading] = useState(true)
  const { isOpen, toggle } = useSidebar()
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [currentUserId, setCurrentUserId] = useState('')

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
        if (data?.id) setCurrentUserId(data.id)
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

  // Fetch unread notification count
  useEffect(() => {
    async function fetchUnreadCount() {
      if (!currentUserId || !token) return
      try {
        const res = await fetch(`${backendBaseUrl}/notifications/user/${currentUserId}/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data?.count ?? 0)
        }
      } catch {
        // Unread count failure is non-blocking
      }
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [backendBaseUrl, token, currentUserId])

  // Fetch recent notifications
  useEffect(() => {
    async function fetchRecentNotifs() {
      if (!currentUserId || !token) return
      try {
        const res = await fetch(`${backendBaseUrl}/notifications/user/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : (data?.content || [])
          setRecentNotifications(list.slice(0, 3))
        }
      } catch {
        // Non-blocking
      }
    }
    fetchRecentNotifs()
  }, [backendBaseUrl, token, currentUserId])

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const first = profile.firstName || profile.username || 'User'
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || 'Campus User'
  const displayRole = profile.role || localStorage.getItem('authRole') || 'USER'
  const googleAvatarCandidate = googleAvatarUrl || ''
  const displayUserType = profile.userType || 'STUDENT'
  const accountStatus = profile.suspended ? 'SUSPENDED' : 'ACTIVE'
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffSec = Math.floor((now - date) / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  function getNotifIcon(type) {
    switch (type) {
      case 'TICKET_CREATED': return '🎫'
      case 'TICKET_UPDATED': return '🔄'
      case 'TICKET_ASSIGNED': return '👤'
      case 'TICKET_RESOLVED': return '✅'
      case 'TICKET_COMMENT': return '💬'
      case 'TICKET_REJECTED': return '❌'
      case 'MAINTENANCE_SCHEDULED': return '🔧'
      case 'INCIDENT_REPORTED': return '🚨'
      case 'INCIDENT_UPDATED': return '📝'
      default: return '🔔'
    }
  }

  return (
    <div className="ud-wrapper">
      <DashboardSidebar
        fullName={fullName}
        role={displayRole}
        unreadCount={unreadCount}
        currentPage="dashboard"
        onLogout={handleLogout}
        isGoogleLogin={isGoogleLogin}
        googleAvatarUrl={googleAvatarUrl}
        googleEmail={googleEmail}
      />

      <main className="ud-main">
        {/* Hero Banner */}
        <section className="ud-hero">
          <div className="ud-hero-content">
            <div className="ud-hero-text">
              <p className="ud-hero-greeting">{getGreeting()}</p>
              <h1 className="ud-hero-name">{first} 👋</h1>
              <p className="ud-hero-date">{today}</p>
            </div>
            <div className="ud-account-area">
              <button
                type="button"
                className="ud-account-trigger"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
              >
                <div className="ud-topbar-user">
                  <span className="ud-topbar-avatar">
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={fullName}
                        className="ud-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (fullName || first).charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="ud-topbar-info">
                    <p className="ud-topbar-uname">{fullName}</p>
                    <p className="ud-topbar-urole">
                      {displayRole}
                      {isGoogleLogin && (
                        <span className="ud-google-badge" aria-label="Signed in with Google">
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
                <div className="ud-account-dropdown" role="menu" aria-label="Account actions">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="ud-hero-decoration">
            <div className="ud-hero-circle c1" />
            <div className="ud-hero-circle c2" />
            <div className="ud-hero-circle c3" />
          </div>
        </section>

        {/* Stats Row */}
        <section className="ud-stats">
          <article className="ud-stat-card ud-simple-stat" style={{ '--accent': '#3b82f6' }}>
            <div className="ud-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div className="ud-stat-info">
              <p className="ud-stat-label">Account Status</p>
              <p className="ud-stat-value">{accountStatus}</p>
            </div>
            <div className="ud-stat-ring" />
          </article>
          <article className="ud-stat-card ud-simple-stat" style={{ '--accent': '#22c55e' }}>
            <div className="ud-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="ud-stat-info">
              <p className="ud-stat-label">User Type</p>
              <p className="ud-stat-value">{displayUserType}</p>
            </div>
            <div className="ud-stat-ring" />
          </article>
          <article className="ud-stat-card ud-simple-stat" style={{ '--accent': '#a855f7' }}>
            <div className="ud-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div className="ud-stat-info">
              <p className="ud-stat-label">Role</p>
              <p className="ud-stat-value">{displayRole}</p>
            </div>
            <div className="ud-stat-ring" />
          </article>
          <article className="ud-stat-card ud-simple-stat" style={{ '--accent': '#f97316' }}>
            <div className="ud-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="ud-stat-info">
              <p className="ud-stat-label">Last Updated</p>
              <p className="ud-stat-value">{new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="ud-stat-ring" />
          </article>
        </section>

        {/* Main Grid */}
        <section className="ud-grid">
          {/* Profile Card */}
          <article className="ud-card ud-profile-card">
            <div className="ud-card-header">
              <h2>👤 Profile Overview</h2>
              <button type="button" className="ud-card-action" onClick={() => navigate('/profile')}>
                Edit →
              </button>
            </div>
            {loading ? (
              <div className="ud-loading-shimmer">
                <div className="shimmer-line" />
                <div className="shimmer-line short" />
                <div className="shimmer-line" />
                <div className="shimmer-line short" />
              </div>
            ) : (
              <div className="ud-profile-details">
                <div className="ud-profile-row">
                  <span className="ud-profile-label">Full Name</span>
                  <span className="ud-profile-value">{fullName}</span>
                </div>
                <div className="ud-profile-row">
                  <span className="ud-profile-label">Email</span>
                  <span className="ud-profile-value">{profile.email || '—'}</span>
                </div>
                <div className="ud-profile-row">
                  <span className="ud-profile-label">Registration No.</span>
                  <span className="ud-profile-value">{profile.registrationNumber || '—'}</span>
                </div>
                <div className="ud-profile-row">
                  <span className="ud-profile-label">Mobile</span>
                  <span className="ud-profile-value">{profile.mobileNumber || '—'}</span>
                </div>
                <div className="ud-profile-tags">
                  <span className="ud-tag role">{displayRole}</span>
                  <span className="ud-tag type">{displayUserType}</span>
                  <span className={`ud-tag status ${accountStatus.toLowerCase()}`}>{accountStatus}</span>
                </div>
              </div>
            )}
          </article>

          {/* Recent Notifications */}
          <article className="ud-card ud-notif-card">
            <div className="ud-card-header">
              <h2>🔔 Recent Notifications</h2>
              <button type="button" className="ud-card-action" onClick={() => navigate('/notifications')}>
                View All →
              </button>
            </div>
            {recentNotifications.length === 0 ? (
              <div className="ud-empty-state">
                <div className="ud-empty-icon">🎉</div>
                <p>You're all caught up!</p>
                <span>No new notifications</span>
              </div>
            ) : (
              <ul className="ud-notif-list">
                {recentNotifications.map((n) => (
                  <li key={n.id} className={`ud-notif-item ${!n.isRead && !n.read ? 'unread' : ''}`}>
                    <span className="ud-notif-icon">{getNotifIcon(n.type)}</span>
                    <div className="ud-notif-body">
                      <p className="ud-notif-msg">{n.message}</p>
                      <span className="ud-notif-time">{formatTimeAgo(n.createdAt)}</span>
                    </div>
                    {(!n.isRead && !n.read) && <span className="ud-notif-dot" />}
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Quick Actions */}
          <article className="ud-card ud-actions-card">
            <div className="ud-card-header">
              <h2>⚡ Quick Actions</h2>
            </div>
            <div className="ud-actions-grid">
              <button type="button" className="ud-action-btn" onClick={() => navigate('/tickets')}>
                <span className="ud-action-icon">🎫</span>
                <span className="ud-action-text">My Tickets</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/bookings')}>
                <span className="ud-action-icon">📅</span>
                <span className="ud-action-text">Bookings</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/catalogue')}>
                <span className="ud-action-icon">📚</span>
                <span className="ud-action-text">Catalogue</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/resources')}>
                <span className="ud-action-icon">📁</span>
                <span className="ud-action-text">Resources</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/profile')}>
                <span className="ud-action-icon">👤</span>
                <span className="ud-action-text">Profile</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/notifications')}>
                <span className="ud-action-icon">🔔</span>
                <span className="ud-action-text">Notifications</span>
                <span className="ud-action-arrow">→</span>
              </button>
              <button type="button" className="ud-action-btn" onClick={() => navigate('/')}>
                <span className="ud-action-icon">🏠</span>
                <span className="ud-action-text">Home Page</span>
                <span className="ud-action-arrow">→</span>
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
