import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/Landing/LandingPage'
import RegisterPage from './pages/Register/RegisterPage'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage'
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
