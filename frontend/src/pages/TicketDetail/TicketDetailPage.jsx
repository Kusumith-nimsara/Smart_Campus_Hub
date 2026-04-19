import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketAPI } from '../../services/ticketAPI'
import { showError, showSuccess } from '../../utils/alerts'
import './TicketDetailPage.css'

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

export default function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const username = localStorage.getItem('authUsername')
    const userId = localStorage.getItem('authUserId')
    setCurrentUser({ username, userId })
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    setLoading(true)
    try {
      const data = await ticketAPI.getTicketById(ticketId)
      setTicket(data)
    } catch (error) {
      showError('Error', error.message)
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommenting(true)
    try {
      const updatedTicket = await ticketAPI.addComment(ticketId, newComment)
      setTicket(updatedTicket)
      setNewComment('')
      showSuccess('Success', 'Comment added')
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      const updatedTicket = await ticketAPI.deleteComment(ticketId, commentId)
      setTicket(updatedTicket)
      showSuccess('Success', 'Comment deleted')
    } catch (error) {
      showError('Error', error.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const canDeleteComment = (comment) => {
    return currentUser?.userId === comment.createdById
  }

  if (loading) {
    return <div className="loading-page">Loading ticket...</div>
  }

  if (!ticket) {
    return <div className="error-page">Ticket not found</div>
  }

  return (
    <div className="ticket-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/tickets')}>
          ← Back to Tickets
        </button>
        <h1>{ticket.title}</h1>
        <span
          className="status-badge-large"
          style={{ backgroundColor: STATUS_COLORS[ticket.status] }}
        >
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      <div className="detail-content">
        {/* Main Info */}
        <div className="detail-section main-info">
          <div className="info-row">
            <div className="info-item">
              <label>Ticket ID</label>
              <code>{ticket.id}</code>
            </div>
            <div className="info-item">
              <label>Priority</label>
              <span
                className="priority-badge-large"
                style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }}
              >
                {ticket.priority}
              </span>
            </div>
            <div className="info-item">
              <label>Created</label>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Category</label>
              <span>{ticket.category}</span>
            </div>
            <div className="info-item">
              <label>Location</label>
              <span>📍 {ticket.resourceLocation}</span>
            </div>
            <div className="info-item">
              <label>Created By</label>
              <span>{ticket.createdByUsername}</span>
            </div>
          </div>

          {ticket.assignedToUsername && (
            <div className="info-row">
              <div className="info-item">
                <label>Assigned To</label>
                <span>👤 {ticket.assignedToUsername}</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="detail-section">
          <h3>Description</h3>
          <div className="description-box">
            {ticket.description}
          </div>
        </div>

        {/* Images */}
        {ticket.images.length > 0 && (
          <div className="detail-section">
            <h3>📸 Attachments ({ticket.images.length})</h3>
            <div className="images-gallery">
              {ticket.images.map((imageBase64, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  onClick={() => setSelectedImage(imageBase64)}
                >
                  <img src={imageBase64} alt={`Attachment ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Notes */}
        {ticket.resolutionNotes && (
          <div className="detail-section">
            <h3>Resolution Notes</h3>
            <div className="resolution-box">
              {ticket.resolutionNotes}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {ticket.status === 'REJECTED' && ticket.rejectionReason && (
          <div className="detail-section rejection-section">
            <h3>Rejection Reason</h3>
            <div className="rejection-box">
              {ticket.rejectionReason}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="divider"></div>

        {/* Comments */}
        <div className="detail-section">
          <h3>Comments ({ticket.comments.length})</h3>

          <div className="comments-list">
            {ticket.comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              ticket.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.createdByUsername}</strong>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  {canDeleteComment(comment) && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              disabled={commenting}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={commenting || !newComment.trim()}
            >
              {commenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}
    </div>
  )
}
