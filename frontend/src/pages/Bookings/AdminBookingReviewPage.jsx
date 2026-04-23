import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllBookings, approveBooking, rejectBooking } from '../../utils/bookingAPI'
import { clearAuthState } from '../../utils/api'
import { showSuccess, showError, showLogoutAlert } from '../../utils/alerts'
import BookingCard from '../../components/bookings/BookingCard'
import ApprovalModal from '../../components/bookings/ApprovalModal'
import './AdminBookingReviewPage.css'

/**
 * AdminBookingReviewPage — Dedicated page for admins to review pending bookings.
 */
export default function AdminBookingReviewPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Admin'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  const sidebarNav = [
    { icon: '📊', label: 'Dashboard', path: '/admin-dashboard' },
    { icon: '👥', label: 'User Management', path: '/admin/user-management' },
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '📚', label: 'Catalogue', path: '/catalogue' },
    { icon: '🎫', label: 'Tickets', path: '/tickets' },
    { icon: '📅', label: 'Bookings', path: '/bookings' },
  ]

  return (
    <main className={`admin-review-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* ═══ SIDEBAR ═══ */}
      <aside className="admin-review-sidebar" aria-hidden={!isSidebarOpen}>
        <div className="admin-review-brand">
          <div className="admin-review-logo">SC</div>
          <h2>Smart Campus</h2>
        </div>

        <div className="admin-review-identity">
          <p className="label">Logged in as</p>
          <p className="name">{username}</p>
          <p className="role">ADMIN</p>
        </div>

        <nav className="admin-review-nav" aria-label="Admin Review Navigation">
          {sidebarNav.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="admin-review-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      {/* ═══ CONTENT ═══ */}
      <section className="admin-review-content">
        <header className="admin-review-topbar">
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
      </section>

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
    </main>
  )
}
