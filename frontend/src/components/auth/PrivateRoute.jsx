export default function PrivateRoute({ isAuthenticated, children, fallback = null }) {
  if (!isAuthenticated) {
    return fallback
  }

  return children
}
