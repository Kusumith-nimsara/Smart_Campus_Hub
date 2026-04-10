import { Navigate } from 'react-router-dom'

function readRole() {
  const rawRole = localStorage.getItem('role')
  if (!rawRole) {
    return ''
  }

  return rawRole.trim().toUpperCase()
}

export default function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('token')

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