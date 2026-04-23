import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllBookings, approveBooking, rejectBooking } from '../../utils/bookingAPI'
import { showSuccess, showError } from '../../utils/alerts'
import BookingCard from '../../components/bookings/BookingCard'
import ApprovalModal from '../../components/bookings/ApprovalModal'
import { useSidebar } from '../../contexts/SidebarContext'
import './AdminBookingReviewPage.css'

/**
 * AdminBookingReviewPage — Dedicated page for admins to review pending bookings.
 */
export default function AdminBookingReviewPage() {
  const navigate = useNavigate()
  const { toggle } = useSidebar()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pageSize: 50 }
      if (statusFilter) params.status = statusFilter
      const data = await getAllBookings(params)
      setBookings(data.content || [])
    } catch (err) {
      showError('Error', err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  async function handleApprove(bookingId, reason) {
    setIsSubmitting(true)
    try {
      await approveBooking(bookingId, reason)
      showSuccess('Approved!', 'Booking has been approved successfully.')
      setSelectedBooking(null)
      loadBookings()
    } catch (err) {
      showError('Error', err.message || 'Failed to approve booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReject(bookingId, reason) {
    setIsSubmitting(true)
    try {
      await rejectBooking(bookingId, reason)
      showSuccess('Rejected', 'Booking has been rejected.')
      setSelectedBooking(null)
      loadBookings()
    } catch (err) {
      showError('Error', err.message || 'Failed to reject booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  return (
    <section className="admin-review-content">
        <header className="admin-review-topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={toggle}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
            <div>
              <h1>⏳ Booking Review</h1>
              <p>
                {statusFilter === 'PENDING'
                  ? `${pendingCount} pending booking${pendingCount !== 1 ? 's' : ''} awaiting review`
                  : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="admin-review-back-btn"
              onClick={() => navigate('/bookings')}
            >
              ← All Bookings
            </button>
          </div>
        </header>

        {/* Status Filter Tabs */}
        <div className="admin-review-tabs">
          {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', ''].map((status) => (
            <button
              key={status}
              type="button"
              className={`review-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="admin-review-loading">
            <div className="admin-review-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="admin-review-empty">
            <span className="admin-review-empty-icon">✅</span>
            <h3>
              {statusFilter === 'PENDING'
                ? 'No Pending Bookings'
                : 'No Bookings Found'}
            </h3>
            <p>
              {statusFilter === 'PENDING'
                ? 'All booking requests have been reviewed. Great job!'
                : 'No bookings match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="admin-review-grid">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isAdmin={true}
                onApprove={(b) => setSelectedBooking(b)}
                onReject={(b) => setSelectedBooking(b)}
              />
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedBooking && (
          <ApprovalModal
            booking={selectedBooking}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => setSelectedBooking(null)}
            isSubmitting={isSubmitting}
          />
        )}
    </section>
  )
}
