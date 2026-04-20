import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'

export default function BookingsPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || ''
  const fullName = (localStorage.getItem('username') || 'User').split('@')[0]
  const role = (localStorage.getItem('authRole') || 'USER').toUpperCase()
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [profile, setProfile] = useState({ firstName: '', lastName: '' })

  useEffect(() => {
    if (token) {
      fetch(`${backendBaseUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setProfile(data))
        .catch(() => {})
    }
  }, [token, backendBaseUrl])

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || fullName

  return (
    <div style={{ display: 'flex', minHeight: '100vh', marginLeft: '250px', backgroundColor: '#f8fafc' }}>
      <DashboardSidebar
        fullName={displayName}
        role={role}
        currentPage="bookings"
        isGoogleLogin={isGoogleLogin}
        googleAvatarUrl={googleAvatarUrl}
        googleEmail={googleEmail}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#1e293b', margin: '0 0 8px 0', fontWeight: '700' }}>📅 Bookings</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '16px', fontWeight: 500 }}>Manage your facility and resource bookings.</p>
        </header>

        <div style={{ marginTop: '20px', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', margin: 0 }}>Bookings management features will be available soon.</p>
        </div>
      </main>
    </div>
  )
}
