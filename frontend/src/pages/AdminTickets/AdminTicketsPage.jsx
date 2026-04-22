import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showError, showLogoutAlert, showSuccess } from '../../utils/alerts'
import './AdminTicketsPage.css'

export default function AdminTicketsPage() {
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

  const [activeTab, setActiveTab] = useState('open')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  const [openTickets, setOpenTickets] = useState([])
  const [inProgressTickets, setInProgressTickets] = useState([])
  const [resolvedTickets, setResolvedTickets] = useState([])
  const [closedTickets, setClosedTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [technicians, setTechnicians] = useState([])

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveSubmitting, setApproveSubmitting] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [currentAdminId, setCurrentAdminId] = useState('')

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
    async function loadCurrentUser() {
      if (!token) return
      try {
        const response = await fetch(`${backendBaseUrl}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) return
        if (data?.id) setCurrentAdminId(data.id)
      } catch {
        // Keep default when profile lookup fails
      }
    }
    loadCurrentUser()
  }, [backendBaseUrl, token])

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

  useEffect(() => {
    loadTickets()
    loadTechnicians()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const [openRes, inProgRes, resolvedRes, closedRes] = await Promise.all([
        fetch(`${backendBaseUrl}/tickets/admin/open`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendBaseUrl}/tickets/admin/in-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendBaseUrl}/tickets/admin/resolved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendBaseUrl}/tickets?status=CLOSED&page=0&size=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const [openData, inProgData, resolvedData, closedData] = await Promise.all([
        openRes.json(),
        inProgRes.json(),
        resolvedRes.json(),
        closedRes.json(),
      ])

      setOpenTickets(openData.content || [])
      setInProgressTickets(inProgData.content || [])
      setResolvedTickets(resolvedData.content || [])
      setClosedTickets(closedData.content || [])
    } catch (error) {
      showError('Error', 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      const response = await fetch(`${backendBaseUrl}/admin/users?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const technicianUsers = (data.content || []).filter(
          (user) => user.role === 'TECHNICIAN' || user.role === 'MANAGER'
        )
        setTechnicians(technicianUsers)
      }
    } catch {
      // Non-blocking - technicians list is optional for manual entry
    }
  }

  const handleAssignClick = (ticket) => {
    setSelectedTicket(ticket)
    setSelectedTechnician('')
    setShowAssignModal(true)
  }

  const submitAssign = async () => {
    if (!selectedTechnician) {
      showError('Error', 'Please select a technician')
      return
    }

    setAssignSubmitting(true)
    try {
      const response = await fetch(
        `${backendBaseUrl}/tickets/${selectedTicket.id}/assign?technicianId=${selectedTechnician}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to assign ticket')

      showSuccess('Success', 'Ticket assigned to technician')
      setShowAssignModal(false)
      loadTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setAssignSubmitting(false)
    }
  }

  const handleApproveClick = (ticket) => {
    setSelectedTicket(ticket)
    setShowApproveModal(true)
  }

  const submitApprove = async () => {
    setApproveSubmitting(true)
    try {
      const response = await fetch(
        `${backendBaseUrl}/tickets/${selectedTicket.id}/admin/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to approve ticket')

      showSuccess('Success', 'Ticket approved and closed')
      setShowApproveModal(false)
      loadTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setApproveSubmitting(false)
    }
  }

  const handleRejectClick = (ticket) => {
    setSelectedTicket(ticket)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const submitReject = async () => {
    if (!rejectionReason.trim()) {
      showError('Error', 'Please provide a rejection reason')
      return
    }

    setRejectSubmitting(true)
    try {
      const response = await fetch(
        `${backendBaseUrl}/tickets/${selectedTicket.id}/admin/reject-completion`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionReason }),
        }
      )

      if (!response.ok) throw new Error('Failed to reject ticket')

      showSuccess('Success', 'Ticket sent back for revision')
      setShowRejectModal(false)
      loadTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setRejectSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const googleAvatarCandidate =
    googleAvatarUrl ||
    (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')

  const TicketCard = ({ ticket, showActions, actionType }) => (
    <div className="ticket-card">
      <div className="ticket-header">
        <h4>{ticket.title}</h4>
        <span className={`status-badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
      </div>
      <p className="ticket-id">ID: {ticket.id}</p>
      <p className="ticket-location">📍 {ticket.location || 'No location'}</p>
      <p className="ticket-category">🏷️ {ticket.category || 'General'}</p>
      <div className="ticket-meta">
        <span className={`priority ${ticket.priority?.toLowerCase()}`}>{ticket.priority || 'MEDIUM'}</span>
        <span className="date">{formatDate(ticket.createdAt)}</span>
      </div>
      {showActions && (
        <div className="ticket-actions">
          {actionType === 'assign' && (
            <button
              type="button"
              className="action-btn assign"
              onClick={() => handleAssignClick(ticket)}
            >
              Assign to Technician
            </button>
          )}
          {actionType === 'approve' && (
            <div className="action-buttons">
              <button
                type="button"
                className="action-btn approve"
                onClick={() => handleApproveClick(ticket)}
              >
                ✓ Approve & Close
              </button>
              <button
                type="button"
                className="action-btn reject"
                onClick={() => handleRejectClick(ticket)}
              >
                ✗ Send Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <main className={`admin-tickets-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
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
          <button type="button" onClick={() => navigate('/admin-dashboard')}>
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button type="button" className="active" onClick={() => navigate('/admin-tickets')}>
            <span className="nav-icon">🎫</span> Tickets
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
        </nav>

        <button type="button" className="admin-logout" onClick={handleLogout}>↪ Logout</button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
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
              <h1>Ticket Workflow Management 🎫</h1>
              <p>{today}</p>
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
              >
                <div className="admin-topbar-user">
                  <span>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={adminName}
                        className="admin-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      adminName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="admin-topbar-uname">{adminName}</p>
                    <p className="admin-topbar-urole">ADMIN</p>
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="admin-account-dropdown" role="menu">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="ticket-workflow-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            📋 Open ({openTickets.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-progress')}
          >
            ⚙️ In Progress ({inProgressTickets.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            ✓ Resolved ({resolvedTickets.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            ✓✓ Closed ({closedTickets.length})
          </button>
        </div>

        <section className="tickets-grid">
          {loading ? (
            <p className="loading">Loading tickets...</p>
          ) : activeTab === 'open' && openTickets.length === 0 ? (
            <p className="empty-state">No open tickets to assign</p>
          ) : activeTab === 'in-progress' && inProgressTickets.length === 0 ? (
            <p className="empty-state">No tickets in progress</p>
          ) : activeTab === 'resolved' && resolvedTickets.length === 0 ? (
            <p className="empty-state">No tickets pending approval</p>
          ) : activeTab === 'closed' && closedTickets.length === 0 ? (
            <p className="empty-state">No closed tickets</p>
          ) : (
            <>
              {activeTab === 'open' &&
                openTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions actionType="assign" />
                ))}
              {activeTab === 'in-progress' &&
                inProgressTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
                ))}
              {activeTab === 'resolved' &&
                resolvedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions actionType="approve" />
                ))}
              {activeTab === 'closed' &&
                closedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
                ))}
            </>
          )}
        </section>
      </section>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Ticket to Technician</h2>
            <p className="modal-subtitle">{selectedTicket?.title}</p>

            <div className="form-group">
              <label>Select Technician:</label>
              <select value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)}>
                <option value="">-- Choose a technician --</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.firstName} {tech.lastName} ({tech.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={submitAssign}
                disabled={assignSubmitting || !selectedTechnician}
              >
                {assignSubmitting ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Approve Ticket Completion</h2>
            <p className="modal-subtitle">{selectedTicket?.title}</p>
            <p className="modal-text">Are you sure you want to approve this ticket and mark it as closed?</p>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-approve"
                onClick={submitApprove}
                disabled={approveSubmitting}
              >
                {approveSubmitting ? 'Approving...' : 'Approve & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Send Ticket Back for Revision</h2>
            <p className="modal-subtitle">{selectedTicket?.title}</p>

            <div className="form-group">
              <label>Rejection Reason:</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this ticket needs revision..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-reject"
                onClick={submitReject}
                disabled={rejectSubmitting || !rejectionReason.trim()}
              >
                {rejectSubmitting ? 'Sending...' : 'Send Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
