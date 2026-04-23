import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import TicketListPage from '../../components/tickets/TicketListPage'

import { clearAuthState } from '../../utils/api'
import { showLogoutAlert, showError, showSuccess } from '../../utils/alerts'

export default function TicketsPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || ''
  const fullName = (localStorage.getItem('username') || 'User').split('@')[0]
  const role = (localStorage.getItem('authRole') || 'USER').toUpperCase()
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [profile, setProfile] = useState({ firstName: '', lastName: '' })

  // Admin-specific states
  const [adminActiveTab, setAdminActiveTab] = useState('open')
  const [openTickets, setOpenTickets] = useState([])
  const [inProgressTickets, setInProgressTickets] = useState([])
  const [resolvedTickets, setResolvedTickets] = useState([])
  const [closedTickets, setClosedTickets] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [technicians, setTechnicians] = useState([])

  // Technician-specific states
  const [techTickets, setTechTickets] = useState([])
  const [techLoading, setTechLoading] = useState(true)
  const [techFilter, setTechFilter] = useState('assigned')

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveSubmitting, setApproveSubmitting] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [completeSubmitting, setCompleteSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      fetch(`${backendBaseUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setProfile(data))
        .catch(() => {})
    }

    // Load role-specific data
    if (role === 'ADMIN') {
      loadAdminTickets()
      loadTechnicians()
    } else if (role === 'TECHNICIAN' || role === 'MANAGER') {
      loadTechnicianTickets()
    }
  }, [token, backendBaseUrl, role])

  const handleTicketCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    if (role === 'ADMIN') {
      loadAdminTickets()
    } else if (role === 'TECHNICIAN' || role === 'MANAGER') {
      loadTechnicianTickets()
    }
  }, [role])

  // Admin Methods
  const loadAdminTickets = async () => {
    setAdminLoading(true)
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
        fetch(`${backendBaseUrl}/tickets/admin/closed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      // Check for response errors
      if (!openRes.ok || !inProgRes.ok || !resolvedRes.ok || !closedRes.ok) {
        throw new Error('One or more API requests failed')
      }

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
      console.error('Ticket loading error:', error)
      showError('Error', 'Failed to load tickets')
    } finally {
      setAdminLoading(false)
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
      // Non-blocking
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
      loadAdminTickets()
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
      loadAdminTickets()
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
      loadAdminTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setRejectSubmitting(false)
    }
  }

  // Technician Methods
  const loadTechnicianTickets = async () => {
    setTechLoading(true)
    try {
      const response = await fetch(`${backendBaseUrl}/tickets/technician/assigned?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load tickets')
      const data = await response.json()
      setTechTickets(data.content || [])
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setTechLoading(false)
    }
  }

  const handleCompleteTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    setResolutionNotes('')
    setShowCompleteModal(true)
  }

  const submitComplete = async () => {
    if (!resolutionNotes.trim()) {
      showError('Error', 'Please add resolution notes')
      return
    }

    setCompleteSubmitting(true)
    try {
      const response = await fetch(
        `${backendBaseUrl}/tickets/${selectedTicket.id}/technician/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ resolutionNotes })
        }
      )

      if (!response.ok) throw new Error('Failed to complete ticket')

      showSuccess('Success', 'Ticket marked as completed')
      setShowCompleteModal(false)
      setResolutionNotes('')
      loadTechnicianTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setCompleteSubmitting(false)
    }
  }

  const handleRejectTechnicianClick = async (ticket) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const response = await fetch(
        `${backendBaseUrl}/tickets/${ticket.id}/technician/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ rejectionReason: reason })
        }
      )

      if (!response.ok) throw new Error('Failed to reject ticket')

      showSuccess('Success', 'Ticket rejected')
      loadTechnicianTickets()
    } catch (error) {
      showError('Error', error.message)
    }
  }

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || fullName

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const technicianFilteredTickets = techTickets.filter(ticket => {
    if (techFilter === 'assigned') return ticket.status === 'IN_PROGRESS'
    if (techFilter === 'completed') return ticket.status === 'RESOLVED'
    return true
  })

  const TicketCard = ({ ticket, showActions, actionType }) => (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>{ticket.title}</h4>
        <span style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          background: ticket.status === 'OPEN' ? '#fee2e2' : 
                      ticket.status === 'IN_PROGRESS' ? '#fef3c7' :
                      ticket.status === 'RESOLVED' ? '#d1fae5' :
                      ticket.status === 'CLOSED' ? '#e5e7eb' : '#f3f4f6',
          color: ticket.status === 'OPEN' ? '#991b1b' :
                ticket.status === 'IN_PROGRESS' ? '#a16207' :
                ticket.status === 'RESOLVED' ? '#065f46' :
                ticket.status === 'CLOSED' ? '#374151' : '#6b7280'
        }}>{ticket.status}</span>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {ticket.id}</p>
      <p style={{ margin: '6px 0', fontSize: '13px', color: '#4b5563' }}>📍 {ticket.resourceLocation || 'No location'}</p>
      <p style={{ margin: '6px 0', fontSize: '13px', color: '#4b5563' }}>🏷️ {ticket.category || 'General'}</p>
      <div style={{ display: 'flex', gap: '12px', margin: '12px 0', flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          background: ticket.priority === 'HIGH' ? '#fee2e2' :
                      ticket.priority === 'MEDIUM' ? '#fef3c7' :
                      '#d1fae5',
          color: ticket.priority === 'HIGH' ? '#991b1b' :
                ticket.priority === 'MEDIUM' ? '#a16207' :
                '#065f46'
        }}>{ticket.priority || 'MEDIUM'}</span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(ticket.createdAt)}</span>
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {actionType === 'assign' && (
            <button
              onClick={() => handleAssignClick(ticket)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Assign to Technician
            </button>
          )}
          {actionType === 'approve' && (
            <>
              <button
                onClick={() => handleApproveClick(ticket)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                ✓ Approve & Close
              </button>
              <button
                onClick={() => handleRejectClick(ticket)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                ✗ Send Back
              </button>
            </>
          )}
          {actionType === 'complete' && (
            <>
              <button
                onClick={() => handleCompleteTicketClick(ticket)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                ✓ Mark Complete
              </button>
              <button
                onClick={() => handleRejectTechnicianClick(ticket)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                ✗ Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  // Render based on role
  if (role === 'ADMIN') {
    return (
      <>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh' }}>
          <div style={{ padding: '32px', borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1f2937' }}>🎫 Ticket Workflow Management</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Manage the complete ticket lifecycle</p>
          </div>

          <div style={{ padding: '20px 32px', backgroundColor: '#e0e7ff', borderBottom: '1px solid #c7d2fe', borderLeft: '4px solid #6366f1' }}>
            <p style={{ margin: 0, color: '#4f46e5', fontWeight: '600', fontSize: '14px' }}>
              💡 Complete Workflow: Assign tickets to technicians from the OPEN tab, monitor progress in IN PROGRESS tab, review completed work in RESOLVED tab, and manage approvals or rejections accordingly.
            </p>
          </div>

          <div style={{ padding: '24px 32px', display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <button
              onClick={() => setAdminActiveTab('open')}
              style={{
                padding: '10px 16px',
                background: adminActiveTab === 'open' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: adminActiveTab === 'open' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              📋 Open ({openTickets.length})
            </button>
            <button
              onClick={() => setAdminActiveTab('in-progress')}
              style={{
                padding: '10px 16px',
                background: adminActiveTab === 'in-progress' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: adminActiveTab === 'in-progress' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ⚙️ In Progress ({inProgressTickets.length})
            </button>
            <button
              onClick={() => setAdminActiveTab('resolved')}
              style={{
                padding: '10px 16px',
                background: adminActiveTab === 'resolved' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: adminActiveTab === 'resolved' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ✓ Resolved ({resolvedTickets.length})
            </button>
            <button
              onClick={() => setAdminActiveTab('closed')}
              style={{
                padding: '10px 16px',
                background: adminActiveTab === 'closed' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: adminActiveTab === 'closed' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ✓✓ Closed ({closedTickets.length})
            </button>
          </div>

          <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {adminLoading ? (
              <p>Loading tickets...</p>
            ) : adminActiveTab === 'open' && openTickets.length === 0 ? (
              <p>No open tickets</p>
            ) : adminActiveTab === 'in-progress' && inProgressTickets.length === 0 ? (
              <p>No tickets in progress</p>
            ) : adminActiveTab === 'resolved' && resolvedTickets.length === 0 ? (
              <p>No resolved tickets</p>
            ) : adminActiveTab === 'closed' && closedTickets.length === 0 ? (
              <p>No closed tickets</p>
            ) : (
              <>
                {adminActiveTab === 'open' && openTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions actionType="assign" />
                ))}
                {adminActiveTab === 'in-progress' && inProgressTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
                ))}
                {adminActiveTab === 'resolved' && resolvedTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions actionType="approve" />
                ))}
                {adminActiveTab === 'closed' && closedTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
                ))}
              </>
            )}
          </div>
        </main>

        {showAssignModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>Assign Ticket to Technician</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{selectedTicket?.title}</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>Select Technician:</label>
                <select value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#1f2937' }}>
                  <option value="">-- Choose a technician --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.firstName} {tech.lastName} ({tech.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAssignModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>Cancel</button>
                <button onClick={submitAssign} disabled={assignSubmitting || !selectedTechnician} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: assignSubmitting || !selectedTechnician ? 0.6 : 1 }}>{assignSubmitting ? 'Assigning...' : 'Assign'}</button>
              </div>
            </div>
          </div>
        )}

        {showApproveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>Approve Ticket Completion</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{selectedTicket?.title}</p>
              <p style={{ margin: '0 0 24px 0', color: '#4b5563', lineHeight: '1.6' }}>Are you sure you want to approve this ticket and mark it as closed?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowApproveModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>Cancel</button>
                <button onClick={submitApprove} disabled={approveSubmitting} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: approveSubmitting ? 0.6 : 1 }}>{approveSubmitting ? 'Approving...' : 'Approve & Close'}</button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>Send Ticket Back for Revision</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{selectedTicket?.title}</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>Rejection Reason:</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this ticket needs revision..." rows={4} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#1f2937', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRejectModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>Cancel</button>
                <button onClick={submitReject} disabled={rejectSubmitting || !rejectionReason.trim()} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: rejectSubmitting || !rejectionReason.trim() ? 0.6 : 1 }}>{rejectSubmitting ? 'Sending...' : 'Send Back'}</button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  } else if (role === 'TECHNICIAN' || role === 'MANAGER') {
    return (
      <>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh' }}>
          <div style={{ padding: '32px', borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1f2937' }}>🎫 My Assigned Tickets</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>View and complete your assigned tickets</p>
          </div>

          <div style={{ padding: '24px 32px', display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <button
              onClick={() => setTechFilter('assigned')}
              style={{
                padding: '10px 16px',
                background: techFilter === 'assigned' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: techFilter === 'assigned' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ⚙️ In Progress
            </button>
            <button
              onClick={() => setTechFilter('completed')}
              style={{
                padding: '10px 16px',
                background: techFilter === 'completed' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f3f4f6',
                color: techFilter === 'completed' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ✓ Completed
            </button>
          </div>

          <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {techLoading ? (
              <p>Loading tickets...</p>
            ) : technicianFilteredTickets.length === 0 ? (
              <p>{techFilter === 'assigned' ? 'No tickets assigned to you yet' : 'No completed tickets'}</p>
            ) : (
              technicianFilteredTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} showActions={techFilter === 'assigned'} actionType="complete" />
              ))
            )}
          </div>
        </main>

        {showCompleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1f2937' }}>Complete Ticket</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{selectedTicket?.title}</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>Resolution Notes:</label>
                <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Describe how you resolved this ticket..." rows={4} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#1f2937', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCompleteModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>Cancel</button>
                <button onClick={submitComplete} disabled={completeSubmitting || !resolutionNotes.trim()} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: completeSubmitting || !resolutionNotes.trim() ? 0.6 : 1 }}>{completeSubmitting ? 'Submitting...' : 'Mark Complete'}</button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  } else {
    // USER role - show their created tickets
    return (
      <>
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minHeight: '100vh' }}>
          <TicketListPage key={refreshKey} onCreateNew={() => setIsModalOpen(true)} />
          <CreateTicketModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTicketCreated={handleTicketCreated}
          />
        </main>
      </>
    )
  }
}
