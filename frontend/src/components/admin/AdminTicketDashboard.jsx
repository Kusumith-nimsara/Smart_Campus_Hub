import { useState, useEffect } from 'react'
import { ticketAPI } from '../../services/ticketAPI'
import { showError, showSuccess } from '../../utils/alerts'
import './AdminTicketDashboard.css'

const STATUS_COLORS = {
  OPEN: '#ef4444',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
  REJECTED: '#dc2626',
}

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#991b1b',
}

export default function AdminTicketDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [filterStatus])

  const loadTickets = async () => {
    setLoading(true)
    try {
      let response
      if (filterStatus === 'ALL') {
        response = await ticketAPI.getAllTickets(0, 50)
      } else {
        response = await ticketAPI.getTicketsByStatus(filterStatus, 0, 50)
      }
      setTickets(response.content || [])
    } catch (error) {
      showError('Error', error.message)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return
    setUpdating(true)

    try {
      const reason = statusUpdate === 'REJECTED' ? rejectionReason : undefined
      await ticketAPI.updateStatus(selectedTicket.id, statusUpdate, reason)
      showSuccess('Success', 'Ticket status updated')
      setStatusUpdate('')
      setRejectionReason('')
      setShowDetailModal(false)
      loadTickets()
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="admin-ticket-dashboard">
      <div className="dashboard-header">
        <h2>🎫 Ticket Management</h2>
        <div className="filter-buttons">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="no-data">No tickets found</div>
      ) : (
        <div className="tickets-table">
          <div className="table-header">
            <div className="col-title">Title</div>
            <div className="col-user">Created By</div>
            <div className="col-priority">Priority</div>
            <div className="col-status">Status</div>
            <div className="col-date">Created</div>
            <div className="col-action">Action</div>
          </div>

          <div className="table-body">
            {tickets.map(ticket => (
              <div key={ticket.id} className="table-row">
                <div className="col-title">{ticket.title}</div>
                <div className="col-user">{ticket.createdByUsername}</div>
                <div className="col-priority">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="col-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[ticket.status] }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-date">{formatDate(ticket.createdAt)}</div>
                <div className="col-action">
                  <button
                    className="btn-view"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setStatusUpdate(ticket.status)
                      setShowDetailModal(true)
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTicket.title}</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Ticket ID</label>
                  <code>{selectedTicket.id.substring(0, 8)}...</code>
                </div>
                <div className="info-item">
                  <label>Created By</label>
                  <span>{selectedTicket.createdByUsername}</span>
                </div>
                <div className="info-item">
                  <label>Category</label>
                  <span>{selectedTicket.category}</span>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <span>{selectedTicket.resourceLocation}</span>
                </div>
              </div>

              <div className="description">
                <label>Description</label>
                <p>{selectedTicket.description}</p>
              </div>

              {selectedTicket.images.length > 0 && (
                <div className="images-section">
                  <label>Attachments ({selectedTicket.images.length})</label>
                  <div className="images-grid">
                    {selectedTicket.images.map((img, i) => (
                      <img key={i} src={img} alt={`Attachment ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}

              <div className="status-update">
                <label>Update Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => {
                    setStatusUpdate(e.target.value)
                    setRejectionReason('')
                  }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                {statusUpdate === 'REJECTED' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={3}
                  />
                )}
              </div>

              <div className="comments-section">
                <label>Comments ({selectedTicket.comments.length})</label>
                <div className="comments-list">
                  {selectedTicket.comments.slice(0, 3).map(comment => (
                    <div key={comment.id} className="comment-item">
                      <strong>{comment.createdByUsername}</strong>
                      <p>{comment.content}</p>
                      <small>{formatDate(comment.createdAt)}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)} disabled={updating}>
                Close
              </button>
              <button
                className="btn-update"
                onClick={handleStatusUpdate}
                disabled={updating || statusUpdate === selectedTicket.status}
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
