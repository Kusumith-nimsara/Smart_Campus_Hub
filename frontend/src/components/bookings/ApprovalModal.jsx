import { useState } from 'react'
import { formatDateTime, formatTimeRange } from '../../utils/dateUtils'
import { validateReason } from '../../utils/validationUtils'
import './ApprovalModal.css'

/**
 * ApprovalModal — Modal for admin to approve or reject a booking with a reason.
 *
 * @param {Object}   props
 * @param {Object}   props.booking    - BookingResponseDTO to review
 * @param {Function} props.onApprove  - Called with (bookingId, reason)
 * @param {Function} props.onReject   - Called with (bookingId, reason)
 * @param {Function} props.onClose    - Close handler
 * @param {boolean}  props.isSubmitting - Loading state
 */
export default function ApprovalModal({ booking, onApprove, onReject, onClose, isSubmitting }) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  if (!booking) return null

  function handleApprove() {
    const error = validateReason(reason)
    if (error) {
      setReasonError(error)
      return
    }
    onApprove(booking.id, reason.trim())
  }

  function handleReject() {
    const error = validateReason(reason)
    if (error) {
      setReasonError(error)
      return
    }
    onReject(booking.id, reason.trim())
  }

  function handleReasonChange(e) {
    setReason(e.target.value)
    if (reasonError) setReasonError('')
  }

  return (
    <div className="approval-modal-overlay" onClick={onClose}>
      <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-modal-header">
          <h2>📋 Review Booking</h2>
          <button type="button" className="approval-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="approval-modal-body">
          <div className="approval-booking-info">
            <div className="approval-info-row">
              <span className="approval-label">Purpose</span>
              <span className="approval-value">{booking.purpose || 'N/A'}</span>
            </div>
            <div className="approval-info-row">
              <span className="approval-label">Date</span>
              <span className="approval-value">{formatDateTime(booking.startTime)}</span>
            </div>
            <div className="approval-info-row">
              <span className="approval-label">Time</span>
              <span className="approval-value">{formatTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
            <div className="approval-info-row">
              <span className="approval-label">Attendees</span>
              <span className="approval-value">{booking.attendees || '-'}</span>
            </div>
            <div className="approval-info-row">
              <span className="approval-label">Requested by</span>
              <span className="approval-value">{booking.userId || '-'}</span>
            </div>
            {booking.resourceName && (
              <div className="approval-info-row">
                <span className="approval-label">Resource</span>
                <span className="approval-value">{booking.resourceName}</span>
              </div>
            )}
            <div className="approval-info-row">
              <span className="approval-label">Contact</span>
              <span className="approval-value">{booking.contactDetails || '-'}</span>
            </div>
          </div>

          <div className="approval-reason-section">
            <label htmlFor="approval-reason" className="approval-reason-label">
              Reason (optional)
            </label>
            <textarea
              id="approval-reason"
              className={`approval-reason-input ${reasonError ? 'input-error' : ''}`}
              value={reason}
              onChange={handleReasonChange}
              placeholder="Enter a reason for your decision..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            {reasonError && <p className="approval-field-error">{reasonError}</p>}
            <span className="approval-char-count">{reason.length}/500</span>
          </div>
        </div>

        <div className="approval-modal-footer">
          <button
            type="button"
            className="approval-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="approval-btn-reject"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : '✗ Reject'}
          </button>
          <button
            type="button"
            className="approval-btn-approve"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : '✓ Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}
