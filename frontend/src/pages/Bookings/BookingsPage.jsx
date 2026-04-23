import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BookingsPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || ''

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

  return (
    <section style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', color: '#1e293b', margin: '0 0 8px 0', fontWeight: '700' }}>📅 Bookings</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '16px', fontWeight: 500 }}>Manage your facility and resource bookings.</p>
      </header>

      <div style={{ marginTop: '20px', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', margin: 0 }}>Bookings management features will be available soon.</p>
      </div>
    </section>
  )
}
