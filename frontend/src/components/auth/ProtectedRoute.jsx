import { Navigate } from 'react-router-dom'
import { isTokenExpired } from '../../utils/api'

function readRole() {
  const directRole = localStorage.getItem('role') || localStorage.getItem('authRole')
  return directRole ? directRole.trim().toUpperCase() : ''
}

/**
 * ProtectedRoute — validates both token validity AND required role.
 * Uses JWT parsing to check expiry instead of just checking existence.
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  if (!token || isTokenExpired()) {
    // Clear stale auth state
    const keys = ['token', 'authToken', 'role', 'authRole', 'authApproved', 'username', 'authLoginType', 'authAvatarUrl', 'authEmail']
    keys.forEach((key) => localStorage.removeItem(key))
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const currentRole = readRole()
    const neededRole = String(requiredRole).trim().toUpperCase()

    if (currentRole !== neededRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}