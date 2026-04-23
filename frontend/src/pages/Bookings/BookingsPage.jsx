import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBookings, getAllBookings, cancelBooking, approveBooking, rejectBooking } from '../../utils/bookingAPI'
import { clearAuthState } from '../../utils/api'
import { showSuccess, showError, showLogoutAlert, confirmAction } from '../../utils/alerts'
import BookingCard from '../../components/bookings/BookingCard'
import FilterPanel from '../../components/bookings/FilterPanel'
import ApprovalModal from '../../components/bookings/ApprovalModal'
import './BookingsPage.css'

/**
 * BookingsPage — Main bookings listing for both users and admins.
 * Users see their own bookings, admins see all bookings.
 */
export default function BookingsPage() {
  const navigate = useNavigate()
  const role = (localStorage.getItem('authRole') || localStorage.getItem('role') || 'USER').toUpperCase()
  const isAdmin = role === 'ADMIN'
  const username = localStorage.getItem('username') || 'User'
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''
  const googleAvatarCandidate =
    googleAvatarUrl ||
    (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  // Approval modal state
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadBookings = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const params = { ...filters, page, pageSize: 12 }
      const data = isAdmin
        ? await getAllBookings(params)
        : await getUserBookings(params)

      setBookings(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
      setCurrentPage(data.number || 0)
    } catch (err) {
      showError('Error', err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [filters, isAdmin])

  useEffect(() => {
    loadBookings(0)
  }, [loadBookings])

  function handleFilter(newFilters) {
    setFilters(newFilters)
    setCurrentPage(0)
  }

  function handleClearFilters() {
    setFilters({})
    setCurrentPage(0)
  }

  async function handleCancel(booking) {
    const confirmed = await confirmAction({
      title: 'Cancel Booking?',
      text: `Are you sure you want to cancel "${booking.purpose}"?`,
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep It',
    })

    if (!confirmed) return

    try {
      await cancelBooking(booking.id)
      showSuccess('Cancelled', 'Booking has been cancelled successfully.')
      loadBookings(currentPage)
    } catch (err) {
      showError('Error', err.message || 'Failed to cancel booking')
    }
  }

  function handleApproveClick(booking) {
    setSelectedBooking(booking)
  }

  function handleRejectClick(booking) {
    setSelectedBooking(booking)
  }

  async function handleApproveSubmit(bookingId, reason) {
    setIsSubmitting(true)
    try {
      await approveBooking(bookingId, reason)
      showSuccess('Approved!', 'Booking has been approved.')
      setSelectedBooking(null)
      loadBookings(currentPage)
    } catch (err) {
      showError('Error', err.message || 'Failed to approve booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRejectSubmit(bookingId, reason) {
    setIsSubmitting(true)
    try {
      await rejectBooking(bookingId, reason)
      showSuccess('Rejected', 'Booking has been rejected.')
      setSelectedBooking(null)
      loadBookings(currentPage)
    } catch (err) {
      showError('Error', err.message || 'Failed to reject booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const sidebarNav = isAdmin
    ? [
        { icon: '📊', label: 'Dashboard', path: '/admin-dashboard' },
        { icon: '👥', label: 'User Management', path: '/admin/user-management' },
        { icon: '👤', label: 'Profile', path: '/profile' },
        { icon: '🔔', label: 'Notifications', path: '/notifications' },
        { icon: '📚', label: 'Catalogue', path: '/catalogue' },
        { icon: '🎫', label: 'Tickets', path: '/tickets' },
        { icon: '📅', label: 'Bookings', path: '/bookings', active: true },
      ]
    : [
        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { icon: '👤', label: 'Profile', path: '/profile' },
        { icon: '🔔', label: 'Notifications', path: '/notifications' },
        { icon: '📚', label: 'Catalogue', path: '/catalogue' },
        { icon: '🎫', label: 'Tickets', path: '/tickets' },
        { icon: '📅', label: 'Bookings', path: '/bookings', active: true },
      ]

  return (
    <main className={`bookings-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* ═══ SIDEBAR ═══ */}
      <aside className="bookings-sidebar" aria-hidden={!isSidebarOpen}>
        <div className="bookings-brand">
          <div className="bookings-logo">SC</div>
          <h2>Smart Campus</h2>
        </div>

        <div className="bookings-identity">
          <p className="label">Logged in as</p>
          <p className="name">{username}</p>
          <p className="role">{role}</p>
        </div>

        <nav className="bookings-nav" aria-label="Bookings Navigation">
          {sidebarNav.map((item) => (
            <button
              key={item.path}
              type="button"
              className={item.active ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="bookings-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      {/* ═══ CONTENT ═══ */}
      <section className="bookings-content">
        <header className="bookings-topbar">
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
              <h1>📅 {isAdmin ? 'All Bookings' : 'My Bookings'}</h1>
              <p>{totalElements} booking{totalElements !== 1 ? 's' : ''} found</p>
            </div>
          </div>
          <div className="topbar-right">
            {!isAdmin && (
              <button
                type="button"
                className="bookings-create-btn"
                onClick={() => navigate('/bookings/create')}
              >
                + New Booking
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className="bookings-review-btn"
                onClick={() => navigate('/bookings/admin/review')}
              >
                ⏳ Review Pending
              </button>
            )}
            <div className="bookings-account-menu">
              <button
                type="button"
                className="bookings-account-trigger"
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
              >
                <div className="bookings-topbar-user">
                  <span>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={username}
                        className="bookings-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      username.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="bookings-topbar-uname">{username}</p>
                    <p className="bookings-topbar-urole">{role}</p>
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="bookings-account-dropdown" role="menu" aria-label="Account actions">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Filters */}
        <FilterPanel onFilter={handleFilter} isAdmin={isAdmin} onClear={handleClearFilters} />

        {/* Bookings List */}
        {loading ? (
          <div className="bookings-loading">
            <div className="bookings-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bookings-empty">
            <span className="bookings-empty-icon">📋</span>
            <h3>No Bookings Found</h3>
            <p>
              {Object.keys(filters).length > 0
                ? 'No bookings match your current filters. Try adjusting them.'
                : isAdmin
                ? 'There are no booking requests yet.'
                : 'You haven\'t made any bookings yet. Create one to get started!'}
            </p>
            {!isAdmin && (
              <button
                type="button"
                className="bookings-empty-cta"
                onClick={() => navigate('/bookings/create')}
              >
                + Create Your First Booking
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isAdmin={isAdmin}
                  onCancel={handleCancel}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bookings-pagination">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => loadBookings(currentPage - 1)}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => loadBookings(currentPage + 1)}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Approval Modal */}
      {selectedBooking && (
        <ApprovalModal
          booking={selectedBooking}
          onApprove={handleApproveSubmit}
          onReject={handleRejectSubmit}
          onClose={() => setSelectedBooking(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </main>
  )
}
