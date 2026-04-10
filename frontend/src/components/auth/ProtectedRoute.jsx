import { Navigate } from 'react-router-dom'

function readRole() {
  const directRole = localStorage.getItem('role')
  if (directRole) {
    return directRole.trim().toUpperCase()
  }

  const rawRoles = localStorage.getItem('authRoles')
  if (!rawRoles) {
    return ''
  }

  try {
    const parsed = JSON.parse(rawRoles)
    const normalized = Array.isArray(parsed)
      ? parsed.map((role) => String(role).trim().toUpperCase())
      : []

    if (normalized.includes('ADMIN') || normalized.includes('ROLE_ADMIN')) {
      return 'ADMIN'
    }

    if (normalized.includes('USER') || normalized.includes('ROLE_USER')) {
      return 'USER'
    }

    return ''
  } catch {
    return ''
  }
}

export default function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')

  if (!token) {
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