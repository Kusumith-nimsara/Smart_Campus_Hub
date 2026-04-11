import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/Landing/LandingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage'
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage'
import UserDashboardPage from './pages/UserDashboard/UserDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/admin-login" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            isAuthenticated={Boolean(localStorage.getItem('token') || localStorage.getItem('authToken'))}
            fallback={<Navigate to="/login" replace />}
          >
            <UserDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute
            isAuthenticated={Boolean(localStorage.getItem('token') || localStorage.getItem('authToken'))}
            fallback={<Navigate to="/login" replace />}
          >
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admindashboard" element={<Navigate to="/admin-dashboard" replace />} />
      <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
