/**
 * Booking API Utility Functions
 *
 * Provides all API integration methods for the booking feature.
 * Uses the shared apiFetch wrapper for automatic JWT auth and error handling.
 */

import apiFetch from './api'

// =====================================================
// 1. CREATE BOOKING
// =====================================================

/**
 * Create a new booking request.
 *
 * POST /api/bookings
 * Auth: USER or ADMIN
 *
 * @param {Object} bookingData
 * @param {string} bookingData.resourceId   - MongoDB ID of the resource
 * @param {string} bookingData.startTime    - ISO datetime (e.g. "2026-05-01T10:00:00")
 * @param {string} bookingData.endTime      - ISO datetime
 * @param {string} bookingData.purpose      - Booking purpose (5-500 chars)
 * @param {number} bookingData.attendees    - Number of attendees (1-500)
 * @param {string} bookingData.contactDetails - Contact email
 * @returns {Promise<Object>} BookingResponseDTO
 */
export async function createBooking(bookingData) {
  const response = await apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to create booking')
  }

  return response.json()
}

// =====================================================
// 2. GET SINGLE BOOKING
// =====================================================

/**
 * Get a specific booking by ID.
 *
 * GET /api/bookings/{id}
 * Auth: USER (own) or ADMIN (any)
 *
 * @param {string} id - Booking MongoDB ID
 * @returns {Promise<Object>} BookingResponseDTO
 */
export async function getBooking(id) {
  const response = await apiFetch(`/bookings/${id}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to fetch booking')
  }

  return response.json()
}

// =====================================================
// 3. GET USER'S OWN BOOKINGS
// =====================================================

/**
 * Get all bookings for the current authenticated user with optional filters.
 *
 * GET /api/bookings/user/me?status=PENDING&page=0&pageSize=10
 * Auth: USER or ADMIN
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.status]   - PENDING | APPROVED | REJECTED | CANCELLED
 * @param {number} [filters.page]     - Page number (default 0)
 * @param {number} [filters.pageSize] - Items per page (default 20, max 100)
 * @returns {Promise<Object>} Paginated BookingResponseDTO list
 */
export async function getUserBookings(filters = {}) {
  const params = new URLSearchParams()

  if (filters.status) params.append('status', filters.status)
  if (filters.page !== undefined && filters.page !== null) params.append('page', filters.page)
  if (filters.pageSize) params.append('pageSize', filters.pageSize)

  const query = params.toString()
  const url = `/bookings/user/me${query ? `?${query}` : ''}`

  const response = await apiFetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to fetch your bookings')
  }

  return response.json()
}

// =====================================================
// 4. GET ALL BOOKINGS (ADMIN)
// =====================================================

/**
 * Get all bookings in the system (admin only) with optional filters.
 *
 * GET /api/bookings/admin/all?status=PENDING&resourceId=xxx&userId=yyy&page=0&pageSize=20
 * Auth: ADMIN
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.status]     - PENDING | APPROVED | REJECTED | CANCELLED
 * @param {string} [filters.resourceId] - Filter by resource MongoDB ID
 * @param {string} [filters.userId]     - Filter by username
 * @param {number} [filters.page]       - Page number (default 0)
 * @param {number} [filters.pageSize]   - Items per page (default 20, max 100)
 * @returns {Promise<Object>} Paginated BookingResponseDTO list
 */
export async function getAllBookings(filters = {}) {
  const params = new URLSearchParams()

  if (filters.status) params.append('status', filters.status)
  if (filters.resourceId) params.append('resourceId', filters.resourceId)
  if (filters.userId) params.append('userId', filters.userId)
  if (filters.page !== undefined && filters.page !== null) params.append('page', filters.page)
  if (filters.pageSize) params.append('pageSize', filters.pageSize)

  const query = params.toString()
  const url = `/bookings/admin/all${query ? `?${query}` : ''}`

  const response = await apiFetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to fetch bookings')
  }

  return response.json()
}

// =====================================================
// 5. APPROVE BOOKING (ADMIN)
// =====================================================

/**
 * Approve a pending booking (admin only).
 *
 * PUT /api/bookings/{id}/approve?reason=...
 * Auth: ADMIN
 *
 * @param {string} id     - Booking ID to approve
 * @param {string} reason - Approval reason (optional)
 * @returns {Promise<Object>} Updated BookingResponseDTO
 */
export async function approveBooking(id, reason = '') {
  const params = new URLSearchParams()
  if (reason) params.append('reason', reason)

  const query = params.toString()
  const url = `/bookings/${id}/approve${query ? `?${query}` : ''}`

  const response = await apiFetch(url, { method: 'PUT' })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to approve booking')
  }

  return response.json()
}

// =====================================================
// 6. REJECT BOOKING (ADMIN)
// =====================================================

/**
 * Reject a pending booking (admin only).
 *
 * PUT /api/bookings/{id}/reject?reason=...
 * Auth: ADMIN
 *
 * @param {string} id     - Booking ID to reject
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>} Updated BookingResponseDTO
 */
export async function rejectBooking(id, reason = '') {
  const params = new URLSearchParams()
  if (reason) params.append('reason', reason)

  const query = params.toString()
  const url = `/bookings/${id}/reject${query ? `?${query}` : ''}`

  const response = await apiFetch(url, { method: 'PUT' })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to reject booking')
  }

  return response.json()
}

// =====================================================
// 7. CANCEL BOOKING
// =====================================================

/**
 * Cancel/delete a booking.
 * Users can cancel their own PENDING/APPROVED bookings.
 * Admins can cancel any booking.
 *
 * DELETE /api/bookings/{id}
 * Auth: USER (own) or ADMIN (any)
 *
 * @param {string} id - Booking ID to cancel
 * @returns {Promise<Object>} Cancelled BookingResponseDTO
 */
export async function cancelBooking(id) {
  const response = await apiFetch(`/bookings/${id}`, { method: 'DELETE' })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to cancel booking')
  }

  return response.json()
}

// =====================================================
// 8. CHECK CONFLICTS (AVAILABILITY CHECK)
// =====================================================

/**
 * Check if a time slot is available for a resource.
 *
 * GET /api/bookings/conflicts/check?resourceId=X&startTime=Y&endTime=Z
 * Auth: USER or ADMIN
 *
 * @param {string} resourceId - Resource MongoDB ID
 * @param {string} startTime  - ISO datetime string
 * @param {string} endTime    - ISO datetime string
 * @returns {Promise<Object>} { hasConflict: boolean, conflictCount: number, conflicts: [] }
 */
export async function checkConflicts(resourceId, startTime, endTime) {
  const params = new URLSearchParams({
    resourceId,
    startTime,
    endTime,
  })

  const response = await apiFetch(`/bookings/conflicts/check?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to check conflicts')
  }

  return response.json()
}
