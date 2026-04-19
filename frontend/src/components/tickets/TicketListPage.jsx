import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketAPI } from '../../services/ticketAPI'
import { showError } from '../../utils/alerts'
import './TicketListPage.css'

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

export default function TicketListPage({ onCreateNew }) {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTickets()
  }, [page, filterStatus])

  const loadTickets = async () => {
    setLoading(true)
    try {
      let response
      if (filterStatus === 'ALL') {
        response = await ticketAPI.getUserTickets(page, 10)
      } else {
        response = await ticketAPI.getTicketsByStatus(filterStatus, page, 10)
      }
      setTickets(response.content || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      showError('Error', error.message)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket-detail/${ticketId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="ticket-list-page">
      <div className="ticket-list-header">
        <div>
          <h1>🎫 Tickets</h1>
          <p>Manage your maintenance and incident tickets</p>
        </div>
        <button className="btn-create-ticket" onClick={onCreateNew}>
          + New Ticket
        </button>
      </div>

      <div className="ticket-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus(status)
                setPage(0)
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <p>📭 No tickets found</p>
          <p className="hint">Create a new ticket to report an issue</p>
        </div>
      ) : (
        <>
          <div className="ticket-grid">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => handleTicketClick(ticket.id)}
              >
                <div className="ticket-card-header">
                  <h3>{ticket.title}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[ticket.status] }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="ticket-card-body">
                  <p className="ticket-id">ID: {ticket.id.substring(0, 8)}...</p>
                  <p className="ticket-location">📍 {ticket.resourceLocation}</p>
                  <p className="ticket-category">🏷️ {ticket.category}</p>

                  <div className="ticket-meta">
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }}
                    >
                      {ticket.priority}
                    </span>
                    <span className="date">{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>

                <div className="ticket-card-footer">
                  {ticket.images.length > 0 && (
                    <span className="image-indicator">📸 {ticket.images.length}</span>
                  )}
                  <span className="comment-indicator">💬 {ticket.comments.length}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
