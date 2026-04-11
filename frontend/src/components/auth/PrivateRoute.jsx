import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ isAuthenticated, children, fallback = null }) {
  if (!isAuthenticated) {
    return fallback
  }

  const role = String(localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase()
  const approvedRaw = localStorage.getItem('authApproved')
  const isApproved = approvedRaw == null ? true : approvedRaw === 'true'

  if (role !== 'ADMIN' && !isApproved) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
