import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import TicketListPage from '../../components/tickets/TicketListPage'
import DashboardSidebar from '../../components/common/DashboardSidebar'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'

export default function TicketsPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || ''
  const fullName = (localStorage.getItem('username') || 'User').split('@')[0]
  const role = (localStorage.getItem('authRole') || 'USER').toUpperCase()
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
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

  const handleTicketCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

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
        currentPage="tickets"
        isGoogleLogin={isGoogleLogin}
        googleAvatarUrl={googleAvatarUrl}
        googleEmail={googleEmail}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <TicketListPage key={refreshKey} onCreateNew={() => setIsModalOpen(true)} />
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTicketCreated={handleTicketCreated}
        />
      </main>
    </div>
  )
}
