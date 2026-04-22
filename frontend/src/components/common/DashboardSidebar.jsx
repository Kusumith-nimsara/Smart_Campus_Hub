import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DashboardSidebar.css'

export default function DashboardSidebar({
  fullName,
  role,
  unreadCount = 0,
  currentPage = 'dashboard',
  isGoogleLogin = false,
  googleAvatarUrl = '',
  googleEmail = '',
  onLogout
}) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const actualIsGoogleLogin = isGoogleLogin || localStorage.getItem('authLoginType') === 'google'
  const actualGoogleAvatarUrl = googleAvatarUrl || localStorage.getItem('authAvatarUrl') || ''

  const googleAvatarCandidate = actualGoogleAvatarUrl || ''

  const isActive = (page) => currentPage === page ? 'active' : ''
  const isAdmin = (role || '').toUpperCase() === 'ADMIN'

  return (
    <aside className="dashboard-sidebar" aria-hidden={!isSidebarOpen}>
      <div className="brand-mark">SC</div>
      <h2>Smart Campus</h2>

      <p className="sidebar-user-label">Logged in as</p>
      {actualIsGoogleLogin ? (
        <div className="sidebar-google-profile">
          {googleAvatarCandidate ? (
            <img 
              src={googleAvatarCandidate} 
              alt={fullName} 
              className="sidebar-google-avatar" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="sidebar-google-avatar-placeholder">
              {(fullName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="sidebar-google-info">
            <p className="sidebar-user-name" style={{ margin: 0 }}>{fullName}</p>
            <p className="sidebar-user-role" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {role}
              <span className="sidebar-google-badge" title="Signed in with Google">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="14" height="14">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.8 2.6 12s4.2 9.5 9.4 9.5c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z"/>
                  <path fill="#34A853" d="M3.7 7.6l3.2 2.3c.9-1.8 2.8-3 5.1-3 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 8.4 2.5 5.3 4.6 3.7 7.6z"/>
                  <path fill="#4A90E2" d="M12 21.5c2.5 0 4.7-.8 6.3-2.2l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.8 0-5.2-2.5-5.4-3.8l-3.2 2.5c1.6 3 4.7 4.8 8.6 4.8z"/>
                  <path fill="#FBBC05" d="M3.7 16.7l3.2-2.5c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L3.7 7.6C3 8.9 2.6 10.4 2.6 12s.4 3.1 1.1 4.7z"/>
                </svg>
              </span>
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="sidebar-user-name">{fullName}</p>
          <p className="sidebar-user-role">{role}</p>
        </>
      )}

      <nav className="sidebar-menu" aria-label="Dashboard Menu">
        <button
          type="button"
          className={isActive('dashboard')}
          onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
        >
          📊 Dashboard
        </button>
        {isAdmin && (
          <button
            type="button"
            className={isActive('user-management')}
            onClick={() => navigate('/admin/user-management')}
          >
            👥 User Management
          </button>
        )}
        <button
          type="button"
          className={isActive('profile')}
          onClick={() => navigate('/profile')}
        >
          👤 Profile
        </button>
        <button
          type="button"
          className={isActive('notifications')}
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative' }}
        >
          🔔 Notifications
          {unreadCount > 0 && (
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
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className={isActive('catalogue')}
          onClick={() => navigate('/catalogue')}
        >
          📚 Catalogue
        </button>
        <button
          type="button"
          className={isActive('tickets')}
          onClick={() => navigate('/tickets')}
        >
          🎫 Tickets
        </button>
        <button
          type="button"
          className={isActive('bookings')}
          onClick={() => navigate('/bookings')}
        >
          📅 Bookings
        </button>
      </nav>

      <button type="button" className="sidebar-logout" onClick={onLogout}>
        ↪ Logout
      </button>
    </aside>
  )
}
