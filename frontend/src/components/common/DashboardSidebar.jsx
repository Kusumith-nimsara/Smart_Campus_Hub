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

  const isActive = (page) => currentPage === page ? 'active' : ''
  const isAdmin = (role || '').toUpperCase() === 'ADMIN'

  return (
    <aside className="dashboard-sidebar" aria-hidden={!isSidebarOpen}>
      <div className="brand-mark">SC</div>
      <h2>Smart Campus</h2>

      <p className="sidebar-user-label">Logged in as</p>
      <p className="sidebar-user-name">{fullName}</p>
      <p className="sidebar-user-role">{role}</p>

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
