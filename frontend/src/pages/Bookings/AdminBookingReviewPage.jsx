import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllBookings, approveBooking, rejectBooking } from '../../utils/bookingAPI'
import { clearAuthState } from '../../utils/api'
import { showSuccess, showError, showLogoutAlert } from '../../utils/alerts'
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
  const [statusFilter, setStatusFilter] = useState('') // Default to fetch all bookings

  const username = localStorage.getItem('username') || 'Admin'
  const role = (localStorage.getItem('authRole') || localStorage.getItem('role') || 'ADMIN').toUpperCase()
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''
  const googleAvatarCandidate = googleAvatarUrl || (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')
  
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (!isAccountMenuOpen) return
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isAccountMenuOpen])

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

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

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <div className="bookings-account-menu" ref={accountMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="bookings-account-trigger"
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div className="bookings-topbar-user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 'bold', color: '#475569' }}>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      username.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="bookings-topbar-uname" style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{username}</p>
                    <p className="bookings-topbar-urole" style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{role}</p>
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="bookings-account-dropdown" role="menu" aria-label="Account actions" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '0.5rem', minWidth: '150px', zIndex: 50 }}>
                  <button type="button" onClick={handleLogout} role="menuitem" style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: '#ef4444', fontSize: '0.9rem' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Status Filter Tabs */}
        {/* 
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
        */}

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
