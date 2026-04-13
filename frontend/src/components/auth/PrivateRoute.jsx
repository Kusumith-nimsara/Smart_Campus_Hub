import { Navigate } from 'react-router-dom'
import { isTokenExpired } from '../../utils/api'

/**
 * PrivateRoute — validates the JWT token exists AND is not expired.
 * Also checks approval status for non-admin users.
 * A fake token set via console will fail the JWT parsing check.
 */
export default function PrivateRoute({ children, fallback = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  // No token at all — redirect to login
  if (!token) {
    return fallback || <Navigate to="/login" replace />
  }

  // Token exists but is expired or malformed — clear auth and redirect
  if (isTokenExpired()) {
    const keys = ['token', 'authToken', 'role', 'authRole', 'authApproved', 'username', 'authLoginType', 'authAvatarUrl']
    keys.forEach((key) => localStorage.removeItem(key))
    return <Navigate to="/login" replace />
  }

  const role = String(localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase()
  const approvedRaw = localStorage.getItem('authApproved')
  const isApproved = approvedRaw == null ? true : approvedRaw === 'true'

  if (role !== 'ADMIN' && !isApproved) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
