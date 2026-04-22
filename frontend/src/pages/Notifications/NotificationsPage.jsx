import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert, showSuccess, confirmAction } from '../../utils/alerts'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import './NotificationsPage.css'

const FILTER_OPTIONS = [
  { key: 'ALL', label: 'All', icon: '📋' },
  { key: 'TICKET', label: 'Tickets', icon: '🎫' },
  { key: 'MAINTENANCE', label: 'Maintenance', icon: '🔧' },
  { key: 'INCIDENT', label: 'Incidents', icon: '⚠️' },
  { key: 'UNREAD', label: 'Unread', icon: '🔵' },
]

function getTypeIcon(type) {
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

function getIconClass(type) {
  switch (type) {
    case 'TICKET_CREATED': return 'ticket-created'
    case 'TICKET_UPDATED': return 'ticket-updated'
    case 'TICKET_ASSIGNED': return 'ticket-assigned'
    case 'TICKET_RESOLVED': return 'ticket-resolved'
    case 'TICKET_COMMENT': return 'ticket-updated'
    case 'TICKET_REJECTED': return 'incident'
    case 'MAINTENANCE_SCHEDULED': return 'maintenance'
    case 'INCIDENT_REPORTED': return 'incident'
    case 'INCIDENT_UPDATED': return 'incident-update'
    default: return 'default'
  }
}

function getBadgeClass(referenceType) {
  switch (referenceType) {
    case 'TICKET': return 'ticket'
    case 'MAINTENANCE': return 'maintenance'
    case 'INCIDENT': return 'incident'
    default: return 'system'
  }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') || localStorage.getItem('token') || '', [])
  const isAdmin = (localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase() === 'ADMIN'
  const userName = localStorage.getItem('username') || 'User'
  const userRole = localStorage.getItem('authRole') || localStorage.getItem('role') || 'USER'

  const [userId, setUserId] = useState('')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load user profile to get user ID
  useEffect(() => {
    async function loadProfile() {
      if (!token) return
      try {
        const res = await fetch(`${backendBaseUrl}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data?.id) {
          setUserId(data.id)
        }
      } catch {
        // Profile fetch failure is non-blocking
      }
    }
    loadProfile()
  }, [backendBaseUrl, token])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId || !token) return
    setLoading(true)
    try {
      let url = `${backendBaseUrl}/notifications/user/${userId}`
      if (activeFilter === 'UNREAD') {
        url = `${backendBaseUrl}/notifications/user/${userId}/unread`
      } else if (activeFilter !== 'ALL') {
        url = `${backendBaseUrl}/notifications/user/${userId}/filter?referenceType=${activeFilter}`
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch {
      // Notification fetch failure is non-blocking
    } finally {
      setLoading(false)
    }
  }, [backendBaseUrl, token, userId, activeFilter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Fetch unread count
  useEffect(() => {
    async function fetchUnread() {
      if (!userId || !token) return
      try {
        const res = await fetch(`${backendBaseUrl}/notifications/user/${userId}/unread-count`, {
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
    fetchUnread()
  }, [backendBaseUrl, token, userId, notifications])

  async function handleMarkAsRead(id) {
    try {
      const res = await fetch(`${backendBaseUrl}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
        )
      }
    } catch {
      // Mark as read failure is non-blocking
    }
  }

  async function handleMarkAllAsRead() {
    if (!userId) return
    try {
      const res = await fetch(`${backendBaseUrl}/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })))
        setUnreadCount(0)
        showSuccess('Done', 'All notifications marked as read')
      }
    } catch {
      // Mark all as read failure is non-blocking  
    }
  }

  async function handleDeleteNotification(id, e) {
    e.stopPropagation()
    const confirmed = await confirmAction({
      title: 'Delete Notification?',
      text: 'This notification will be permanently removed.',
      confirmText: 'Delete',
    })
    if (!confirmed) return

    try {
      const res = await fetch(`${backendBaseUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        showSuccess('Deleted', 'Notification removed')
      }
    } catch {
      // Delete failure is non-blocking
    }
  }

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  // Stats
  const totalCount = notifications.length
  const ticketCount = notifications.filter((n) => n.referenceType === 'TICKET').length
  const maintenanceCount = notifications.filter((n) => n.referenceType === 'MAINTENANCE').length
  const incidentCount = notifications.filter((n) => n.referenceType === 'INCIDENT').length

  const dashboardRoute = isAdmin ? '/admin-dashboard' : '/dashboard'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <DashboardSidebar
        fullName={userName}
        role={userRole}
        unreadCount={unreadCount}
        currentPage="notifications"
        onLogout={handleLogout}
      />

      <section className="notif-content" style={{ flex: 1, marginLeft: '250px' }}>

        <header className="notif-topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="notif-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
            <div>
              <h1>🔔 Notifications</h1>
              <p>Stay updated with your tickets, maintenance, and incidents</p>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="notif-stats">
          <article className="notif-stat-card accent-blue">
            <div className="notif-stat-icon">📬</div>
            <p className="notif-stat-value">{unreadCount}</p>
            <p className="notif-stat-label">Unread</p>
          </article>
          <article className="notif-stat-card accent-green">
            <div className="notif-stat-icon">🎫</div>
            <p className="notif-stat-value">{ticketCount}</p>
            <p className="notif-stat-label">Tickets</p>
          </article>
          <article className="notif-stat-card accent-amber">
            <div className="notif-stat-icon">🔧</div>
            <p className="notif-stat-value">{maintenanceCount}</p>
            <p className="notif-stat-label">Maintenance</p>
          </article>
          <article className="notif-stat-card accent-red">
            <div className="notif-stat-icon">⚠️</div>
            <p className="notif-stat-value">{incidentCount}</p>
            <p className="notif-stat-label">Incidents</p>
          </article>
        </div>

        {/* Controls */}
        <div className="notif-controls">
          {isAdmin && (
            <div className="notif-filters">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`notif-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.icon} {f.label}
                  {f.key === 'UNREAD' && unreadCount > 0 && (
                    <span className="notif-filter-badge">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="notif-actions">
            {unreadCount > 0 && (
              <button type="button" className="notif-action-btn primary" onClick={handleMarkAllAsRead}>
                ✓ Mark All Read
              </button>
            )}
            <button type="button" className="notif-action-btn" onClick={fetchNotifications}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="notif-loading">
            <div className="notif-spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>
              {activeFilter === 'ALL'
                ? "You're all caught up! No notifications to display."
                : `No ${activeFilter.toLowerCase()} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => {
              const isUnread = notif.read === false || notif.isRead === false
              return (
                <article
                  key={notif.id}
                  className={`notif-card ${isUnread ? 'unread' : ''} type-${notif.type || ''} ${notif.referenceType === 'TICKET' && notif.referenceId ? 'clickable' : ''}`}
                  onClick={() => {
                    if (isUnread) handleMarkAsRead(notif.id)
                    if (notif.referenceType === 'TICKET' && notif.referenceId) {
                      navigate(`/ticket-detail/${notif.referenceId}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isUnread) handleMarkAsRead(notif.id)
                      if (notif.referenceType === 'TICKET' && notif.referenceId) {
                        navigate(`/ticket-detail/${notif.referenceId}`)
                      }
                    }
                  }}
                >
                  <div className={`notif-icon-wrapper ${getIconClass(notif.type)}`}>
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="notif-body">
                    <h4 className="notif-title">{notif.title || notif.type || 'Notification'}</h4>
                    <p className="notif-message">{notif.message}</p>
                    <div className="notif-meta">
                      <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                      {notif.referenceType && (
                        <span className={`notif-type-badge ${getBadgeClass(notif.referenceType)}`}>
                          {notif.referenceType}
                        </span>
                      )}
                      {notif.referenceId && notif.referenceType === 'TICKET' && (
                        <span className="notif-ref-badge clickable-link">
                          🔗 View Ticket
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notif-card-actions">
                    {isUnread && <div className="notif-read-dot" title="Unread" />}
                    <button
                      type="button"
                      className="notif-dismiss-btn"
                      title="Delete notification"
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                    >
                      ✕
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
