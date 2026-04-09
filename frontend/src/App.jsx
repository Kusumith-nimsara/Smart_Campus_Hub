import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import LandingPage from './pages/Landing/LandingPage'
import RegisterPage from './pages/Register/RegisterPage'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'
import ProfilePage from './pages/Profile/ProfilePage'

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
