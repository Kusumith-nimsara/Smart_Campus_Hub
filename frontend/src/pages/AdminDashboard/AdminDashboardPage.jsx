import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showError, showLogoutAlert, showSuccess } from '../../utils/alerts'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || ''
  const adminName = localStorage.getItem('username') || 'Admin User'
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const [users, setUsers] = useState([])
  const [userType, setUserType] = useState('ADMIN')
  const [accountName, setAccountName] = useState(adminName)
  const [accountEmail, setAccountEmail] = useState(localStorage.getItem('username') || 'admin@smartcampus')
  const [accountRole, setAccountRole] = useState('ADMIN')
  const [accountActive, setAccountActive] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [processingUserId, setProcessingUserId] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [currentAdminId, setCurrentAdminId] = useState('')
  const googleAvatarCandidate = googleAvatarUrl || ''

  useEffect(() => {
    function handleOutsideClick(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    async function loadUsers() {
      if (!token) {
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

        const normalized = Array.isArray(data) ? data : (data?.content ? data.content : [])
        setUsers(normalized)
      } catch {
        // Keep dashboard usable even when users list fails to load.
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [backendBaseUrl, token])

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
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
          return
        }

        const nextType = String(data?.userType || data?.role || 'ADMIN').toUpperCase()
        const nextRole = String(data?.role || 'ADMIN').toUpperCase()
        const displayName = [data?.firstName, data?.lastName].filter(Boolean).join(' ').trim()
        setUserType(nextType)
        setAccountRole(nextRole)
        setAccountName(displayName || data?.username || adminName)
        setAccountEmail(data?.email || localStorage.getItem('username') || 'admin@smartcampus')
        setAccountActive(!data?.suspended)
        if (data?.id) setCurrentAdminId(data.id)
      } catch {
        // Keep default user type when profile lookup fails.
      }
    }

    loadCurrentUser()
  }, [backendBaseUrl, token])

  // Fetch unread notification count
  useEffect(() => {
    async function fetchNotifCount() {
      if (!currentAdminId || !token) return
      try {
        const res = await fetch(`${backendBaseUrl}/notifications/user/${currentAdminId}/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadNotifCount(data?.count ?? 0)
        }
      } catch {
        // Non-blocking
      }
    }
    fetchNotifCount()
    const interval = setInterval(fetchNotifCount, 30000)
    return () => clearInterval(interval)
  }, [backendBaseUrl, token, currentAdminId])

  async function handleApproveUser(userId) {
    setProcessingUserId(userId)

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
      showSuccess('Success', 'User approved.')
    } catch (error) {
      // Approval errors are handled by keeping current state unchanged.
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve user.'
      showError('Approval failed', errorMessage)
    } finally {
      setProcessingUserId('')
    }
  }

  const pendingUsers = users.filter((user) => !user?.approved)

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  return (
    <main className={`admin-dashboard-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar" aria-hidden={!isSidebarOpen}>
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
          <button type="button" className="active" onClick={() => navigate('/admin-dashboard')}>
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button type="button" onClick={() => navigate('/admin/user-management')}>
            <span className="nav-icon">👥</span> User Management
          </button>
          <button type="button" onClick={() => navigate('/profile')}>
            <span className="nav-icon">👤</span> Profile
          </button>
          <button type="button" onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
            <span className="nav-icon">🔔</span> Notifications
            {unreadNotifCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '10px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '700',
                lineHeight: '16px',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
              }}>{unreadNotifCount > 99 ? '99+' : unreadNotifCount}</span>
            )}
          </button>
          <button type="button" onClick={() => navigate('/catalogue')}>
            <span className="nav-icon">📚</span> Catalogue
          </button>
          <button type="button" onClick={() => navigate('/tickets')}>
            <span className="nav-icon">🎫</span> Tickets
          </button>
          <button type="button" onClick={() => navigate('/bookings')}>
            <span className="nav-icon">📅</span> Bookings
          </button>
        </nav>

        <button type="button" className="admin-logout" onClick={handleLogout}>↪ Logout</button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              type="button" 
              className="sidebar-toggle-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-muted">Admin Workspace</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span className="breadcrumb-active">Dashboard</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="admin-account-menu" ref={accountMenuRef}>
              <button
                type="button"
                className="admin-account-trigger"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
              >
                <div className="admin-topbar-user">
                  <span>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={accountName || adminName}
                        className="admin-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (accountName || adminName).charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="admin-topbar-uname">{accountName || adminName}</p>
                    <p className="admin-topbar-urole">
                      {accountRole || 'ADMIN'}
                      {isGoogleLogin && (
                        <span className="admin-login-provider" aria-label="Signed in with Google">
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
                <div className="admin-account-dropdown" role="menu" aria-label="Account actions">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="admin-hero">
          <div className="admin-hero-content">
            <span className="hero-badge">Administrator Console</span>
            <h1 className="hero-title">Welcome back, {accountName.split(' ')[0]} 👋</h1>
            <p className="hero-subtitle">You have {pendingUsers.length} pending user approvals and {unreadNotifCount} unread notifications today.</p>
          </div>
          <div className="admin-hero-decoration">
             <div className="hero-shape shape-1" />
             <div className="hero-shape shape-2" />
          </div>
        </section>

        <section className="admin-stats-grid">
          <article className="stat-card account">
            <div className="stat-card-icon account-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Your Account</h3>
              <p className="primary">{accountName}</p>
              <p className="secondary">{accountEmail}</p>
            </div>
            <div className="stat-card-ring" />
          </article>
          <article className="stat-card role-card">
            <div className="stat-card-icon role-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Your Role</h3>
              <p className="primary">{accountRole}</p>
              <p className="secondary">{userType}</p>
            </div>
            <div className="stat-card-ring" />
          </article>
          <article className="stat-card status">
            <div className="stat-card-icon status-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="stat-card-body">
              <h3>Status</h3>
              <p className="primary">{accountActive ? 'Active' : 'Suspended'}</p>
              <p className="secondary">{accountActive ? 'Secure Session' : 'Access Limited'}</p>
            </div>
            <div className="stat-card-ring" />
          </article>
        </section>

        <section className="admin-panel features">
          <div className="panel-header">
            <h2>⚡ Campus Management Focus</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-item resources" onClick={() => navigate('/catalogue')}>
              <div className="fi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <div className="fi-text">
                <h4>Resources</h4>
                <p>Manage campus resources and labs</p>
              </div>
            </article>
            <article className="feature-item bookings" onClick={() => navigate('/bookings')}>
              <div className="fi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="fi-text">
                <h4>Bookings</h4>
                <p>Schedule facilities and approvals</p>
              </div>
            </article>
            <article className="feature-item tickets" onClick={() => navigate('/tickets')}>
              <div className="fi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5.88 14 10l5.12.12c1 .02 1.63 1.05 1.15 1.93l-4.5 8.35c-.6 1.11-2.27.79-2.42-.45L12 14l-5.12-.12c-1-.02-1.63-1.05-1.15-1.93l4.5-8.35c.6-1.11 2.27-.79 2.42.45Z" /></svg>
              </div>
              <div className="fi-text">
                <h4>Tickets</h4>
                <p>Track support and maintenance issues</p>
              </div>
            </article>
            <article className="feature-item notifications" onClick={() => navigate('/notifications')}>
              <div className="fi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div className="fi-text">
                <h4>Notifications {unreadNotifCount > 0 && <span className="notif-badge">{unreadNotifCount}</span>}</h4>
                <p>Broadcast updates to campus users</p>
              </div>
            </article>
          </div>
        </section>

        <section className="admin-bottom-grid">
          <article className="admin-panel quick-actions">
            <h2>🚀 Quick Actions</h2>
            <div className="action-grid">
              <button type="button" onClick={() => navigate('/profile')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Manage Profile
              </button>
              <button type="button" onClick={() => navigate('/catalogue')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                View Resources
              </button>
              <button type="button" onClick={() => navigate('/bookings')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Create Booking
              </button>
              <button type="button" onClick={() => navigate('/tickets')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Open Tickets
              </button>
            </div>
          </article>

          <article className="admin-panel pending-widget">
            <h2>⏳ Pending Approvals</h2>
            {loadingUsers ? (
              <p className="admin-muted">Loading users...</p>
            ) : pendingUsers.length === 0 ? (
              <p className="admin-muted">No pending user accounts.</p>
            ) : (
              <div className="pending-list">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="pending-item">
                    <div className="pending-item-left">
                      <div className="pending-avatar">
                        {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="pending-info">
                        <p className="pending-name">{user.firstName || user.username || 'User'}</p>
                        <p className="pending-email">{user.email || 'No email'}</p>
                      </div>
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

      </section>
    </main>
  )
}
