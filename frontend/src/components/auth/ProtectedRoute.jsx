import { Navigate } from 'react-router-dom'
import { isTokenExpired } from '../../utils/api'

function readRole() {
  const directRole = localStorage.getItem('role') || localStorage.getItem('authRole')
  return directRole ? directRole.trim().toUpperCase() : ''
}

/**
 * ProtectedRoute — validates both token validity AND required role(s).
 * Uses JWT parsing to check expiry instead of just checking existence.
 * Supports single role (requiredRole) or multiple roles (requiredRoles array)
 */
export default function ProtectedRoute({ children, requiredRole = null, requiredRoles = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  if (!token || isTokenExpired()) {
    // Clear stale auth state
    const keys = ['token', 'authToken', 'role', 'authRole', 'authApproved', 'username', 'authLoginType', 'authAvatarUrl', 'authEmail']
    keys.forEach((key) => localStorage.removeItem(key))
    return <Navigate to="/login" replace />
  }

  const currentRole = readRole()

  // Check single required role
  if (requiredRole) {
    const neededRole = String(requiredRole).trim().toUpperCase()
    if (currentRole !== neededRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Check multiple required roles
  if (requiredRoles && Array.isArray(requiredRoles)) {
    const allowedRoles = requiredRoles.map(r => String(r).trim().toUpperCase())
    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}