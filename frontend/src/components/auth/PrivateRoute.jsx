import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isTokenExpired, API_BASE_URL, getAuthHeaders } from '../../utils/api'

/**
 * PrivateRoute — validates the JWT token exists AND is not expired.
 * Also checks approval status for non-admin users. If the local
 * state shows pending approval, verify with the backend once so
 * users approved after login don't remain blocked until re-login.
 */
export default function PrivateRoute({ children, fallback = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  const [checking, setChecking] = useState(false)
  const [allowed, setAllowed] = useState(null)

  // No token at all — redirect to login
  if (!token) {
    return fallback || <Navigate to="/login" replace />
  }

  // Token exists but is expired or malformed — clear auth and redirect
  if (isTokenExpired()) {
    const keys = ['token', 'authToken', 'role', 'authRole', 'authApproved', 'username', 'authLoginType', 'authAvatarUrl', 'authEmail']
    keys.forEach((key) => localStorage.removeItem(key))
    return <Navigate to="/login" replace />
  }

  const role = String(localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase()
  const approvedRaw = localStorage.getItem('authApproved')
  const isApproved = approvedRaw == null ? true : approvedRaw === 'true'

  useEffect(() => {
    let mounted = true

    // If user is admin or already approved, allow immediately.
    if (role === 'ADMIN' || isApproved) {
      setAllowed(true)
      return () => (mounted = false)
    }

    // For non-admins with a stored pending flag, verify once with backend
    // to pick up any approval that happened after the token was issued.
    setChecking(true)
    fetch(`${API_BASE_URL}/user/me`, { headers: getAuthHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to verify user')
        const data = await res.json()
        const verifyApproved = typeof data?.approved === 'boolean' ? data.approved : true
        // Persist the up-to-date approval state for other components
        localStorage.setItem('authApproved', String(verifyApproved))
        if (mounted) setAllowed(verifyApproved || role === 'ADMIN')
      })
      .catch(() => {
        if (mounted) setAllowed(false)
      })
      .finally(() => {
        if (mounted) setChecking(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // While we are verifying approval, show the provided fallback (or null)
  if (checking) return fallback

  if (allowed === false) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
