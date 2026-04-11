import { Navigate } from 'react-router-dom'

function readRole() {
  const directRole = localStorage.getItem('role') || localStorage.getItem('authRole')
  return directRole ? directRole.trim().toUpperCase() : ''
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