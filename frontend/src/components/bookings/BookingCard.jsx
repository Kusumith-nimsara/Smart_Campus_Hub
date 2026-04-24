import { formatDateTime, formatTimeRange, formatRelativeTime, getDurationHours } from '../../utils/dateUtils'
import './BookingCard.css'

/**
 * BookingCard — Displays a single booking with status badge, details, and actions.
 *
 * @param {Object}   props
 * @param {Object}   props.booking    - BookingResponseDTO
 * @param {boolean}  props.isAdmin    - Whether the viewer is admin
 * @param {Function} props.onCancel   - Cancel handler
 * @param {Function} props.onApprove  - Approve handler (admin)
 * @param {Function} props.onReject   - Reject handler (admin)
 * @param {Function} props.onClick    - Click handler for detail view
 */
export default function BookingCard({ booking, isAdmin, onCancel, onApprove, onReject, onClick }) {
  if (!booking) return null

  const status = booking.status || 'PENDING'
  const statusClass = `booking-status-badge status-${status.toLowerCase()}`

  const duration = getDurationHours(booking.startTime, booking.endTime)
  const canCancel = status === 'PENDING' || status === 'APPROVED'
  const canApproveReject = isAdmin && status === 'PENDING'

  return (
    <article className="booking-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="booking-card-header">
        <div className="booking-card-title-row">
          <h3 className="booking-card-purpose">{booking.purpose || 'No purpose specified'}</h3>
          <span className={statusClass}>{status}</span>
        </div>
        <p className="booking-card-meta">
          <span className="booking-card-icon">📅</span>
          {formatDateTime(booking.startTime)}
        </p>
      </div>

      <div className="booking-card-body">
        <div className="booking-card-details">
          <div className="booking-detail-item">
            <span className="detail-label">⏰ Time</span>
            <span className="detail-value">{formatTimeRange(booking.startTime, booking.endTime)}</span>
          </div>
          <div className="booking-detail-item">
            <span className="detail-label">⏱️ Duration</span>
            <span className="detail-value">{duration}h</span>
          </div>
          <div className="booking-detail-item">
            <span className="detail-label">👥 Attendees</span>
            <span className="detail-value">{booking.attendees || '-'}</span>
          </div>
          {booking.resourceName && (
            <div className="booking-detail-item">
              <span className="detail-label">🏢 Resource</span>
              <span className="detail-value">{booking.resourceName}</span>
            </div>
          )}
          {(booking.resourceLocation || booking.location) && (
            <div className="booking-detail-item">
              <span className="detail-label">📍 Location</span>
              <span className="detail-value">{booking.resourceLocation || booking.location}</span>
            </div>
          )}
          {!booking.resourceName && booking.resourceId && (
            <div className="booking-detail-item">
              <span className="detail-label">🆔 Resource ID</span>
              <span className="detail-value resource-id-text">{booking.resourceId}</span>
            </div>
          )}
        </div>

        {(booking.approvalReason || booking.rejectionReason) && (
          <div className={`booking-reason ${booking.rejectionReason ? 'reason-rejected' : 'reason-approved'}`}>
            <span className="reason-label">
              {booking.rejectionReason ? '❌ Rejection Reason' : '✅ Approval Reason'}
            </span>
            <p className="reason-text">{booking.rejectionReason || booking.approvalReason}</p>
          </div>
        )}

        {isAdmin && booking.userId && (
          <div className="booking-card-user">
            <span className="detail-label">👤 Booked by</span>
            <span className="detail-value">{booking.userId}</span>
          </div>
        )}
      </div>

      <div className="booking-card-footer">
        <span className="booking-card-time-ago">{formatRelativeTime(booking.createdAt)}</span>
        <div className="booking-card-actions" onClick={(e) => e.stopPropagation()}>
          {canApproveReject && (
            <>
              <button
                type="button"
                className="btn-approve"
                onClick={() => onApprove && onApprove(booking)}
                title="Approve booking"
              >
                ✓ Approve
              </button>
              <button
                type="button"
                className="btn-reject"
                onClick={() => onReject && onReject(booking)}
                title="Reject booking"
              >
                ✗ Reject
              </button>
            </>
          )}
          {canCancel && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => onCancel && onCancel(booking)}
              title="Cancel booking"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
