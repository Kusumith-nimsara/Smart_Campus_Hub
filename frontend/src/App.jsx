import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import LandingPage from './pages/Landing/LandingPage'
import RegisterPage from './pages/Register/RegisterPage'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
