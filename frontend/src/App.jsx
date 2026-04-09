import { useState } from 'react'
import LoginPage from './components/auth/Login/LoginPage'
import LandingPage from './pages/Landing/LandingPage'
import RegisterPage from './pages/Register/RegisterPage'
import AdminLoginPage from './pages/AdminLogin/AdminLoginPage'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  if (currentPage === 'login') {
    return <LoginPage onNavigate={setCurrentPage} />
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={setCurrentPage} />
  }

  if (currentPage === 'admin') {
    return <AdminLoginPage onNavigate={setCurrentPage} />
  }

  return <LandingPage onNavigate={setCurrentPage} />
}

export default App
