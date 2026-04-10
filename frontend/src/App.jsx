import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import LandingPage from './pages/Landing/LandingPage'
import RegisterPage from './pages/Register/RegisterPage'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage'

function normalizeRoles(input) {
  if (Array.isArray(input)) {
    return input
      .map((role) => String(role).trim().toUpperCase())
      .filter(Boolean)
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((role) => role.trim().toUpperCase())
      .filter(Boolean)
  }

  return []
}

function isAdminAuthenticated() {
  const token = localStorage.getItem('authToken')
  const rawRoles = localStorage.getItem('authRoles')

  if (!token || !rawRoles) {
    return false
  }

  try {
    const parsedRoles = JSON.parse(rawRoles)
    const roles = normalizeRoles(parsedRoles)
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')
  } catch {
    const roles = normalizeRoles(rawRoles)
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')
  }
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute
            isAuthenticated={Boolean(localStorage.getItem('authToken'))}
            fallback={<Navigate to="/login" replace />}
          >
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute
            isAuthenticated={isAdminAuthenticated()}
            fallback={<Navigate to="/admin-login" replace />}
          >
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admindashboard"
        element={<Navigate to="/admin-dashboard" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
