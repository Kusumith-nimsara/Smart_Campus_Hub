import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('Loading profile...')
  const [role, setRole] = useState(() => (localStorage.getItem('authRole') || localStorage.getItem('role') || 'USER'))

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setMessage('No token found. Please login first.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${backendBaseUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? 'Failed to load profile.')
        }

        setUsername(data.username ?? '')
        setEmail(data.email ?? '')
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setRegistrationNumber(data.registrationNumber ?? '')
        setMobileNumber(data.mobileNumber ?? '')
        const loadedRole = String(data.role ?? role ?? 'USER').toUpperCase()
        const loadedApproved = typeof data.approved === 'boolean' ? data.approved : true
        setRole(loadedRole)
        localStorage.setItem('role', loadedRole)
        localStorage.setItem('authRole', loadedRole)
        localStorage.setItem('authApproved', String(loadedApproved))
        setMessage('Profile loaded.')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile.'
        setMessage(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [backendBaseUrl, token])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('Saving profile updates...')

    try {
      const payload = {
        username,
        email,
        firstName,
        lastName,
        registrationNumber,
        mobileNumber,
      }

      if (password.trim()) {
        payload.password = password
      }

      const response = await fetch(`${backendBaseUrl}/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to update profile.')
      }

      setUsername(data.username ?? username)
      setEmail(data.email ?? email)
      setFirstName(data.firstName ?? firstName)
      setLastName(data.lastName ?? lastName)
      setRegistrationNumber(data.registrationNumber ?? registrationNumber)
      setMobileNumber(data.mobileNumber ?? mobileNumber)
      const updatedRole = String(data.role ?? role ?? 'USER').toUpperCase()
      const updatedApproved = typeof data.approved === 'boolean' ? data.approved : true
      setRole(updatedRole)
      localStorage.setItem('role', updatedRole)
      localStorage.setItem('authRole', updatedRole)
      localStorage.setItem('authApproved', String(updatedApproved))
      setPassword('')
      setMessage('Profile updated successfully.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.'
      setMessage(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!confirmed) {
      return
    }

    setDeleting(true)
    setMessage('Deleting account...')

    try {
      const response = await fetch(`${backendBaseUrl}/user/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to delete account.')
      }

      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('authRole')
      localStorage.removeItem('authApproved')
      localStorage.removeItem('username')
      localStorage.removeItem('authToken')
      localStorage.removeItem('authLoginType')
      setMessage('Account deleted successfully.')
      navigate('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account.'
      setMessage(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('authRole')
    localStorage.removeItem('authApproved')
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authLoginType')
    navigate('/login')
  }

  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
  const loginType = isAdmin ? 'ADMIN' : 'USER'
  const fullName = `${firstName} ${lastName}`.trim() || username || 'Campus User'
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <main className="profile-page">
      <aside className="profile-sidebar">
        <div className="brand-mark">SC</div>
        <h2>Smart Campus</h2>

        <p className="sidebar-user-label">Logged in as</p>
        <p className="sidebar-user-name">{fullName}</p>
        <p className="sidebar-user-role">{loginType}</p>

        <nav className="sidebar-menu" aria-label="Dashboard Menu">
          <button type="button" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}>Dashboard</button>
          <button type="button" className="active" onClick={() => navigate('/profile')}>Profile</button>
          <button type="button">Notifications</button>
          <button type="button">Resources</button>
          <button type="button">Bookings</button>
          <button type="button">Tickets</button>
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <section className="profile-content">
        <header className="profile-topbar">
          <div>
            <h1>Welcome back, {firstName || username || 'User'}!</h1>
            <p>{today}</p>
          </div>
          <button type="button" className="profile-top-action" onClick={() => navigate('/')}>
            Back to Landing
          </button>
        </header>

        <div className="profile-widgets">
          <article className="widget profile-widget">
            <h2>Your Profile</h2>
            {loading ? (
              <p className="profile-status">Loading profile...</p>
            ) : (
              <form className="profile-form" onSubmit={handleSave}>
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label>
                  First Name
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Registration Number
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(event) => setRegistrationNumber(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                    required
                  />
                </label>

                <label>
                  New Password (Optional)
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    placeholder="Leave blank to keep current password"
                  />
                </label>

                <div className="profile-actions">
                  <button type="submit" disabled={saving || deleting}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleDeleteAccount}
                    disabled={saving || deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            )}
            <p className="profile-status">{message}</p>
          </article>

          <article className="widget quick-links">
            <h2>Quick Links</h2>
            <button type="button">Resources</button>
            <button type="button">Bookings</button>
            <button type="button">Tickets</button>
          </article>
        </div>
      </section>
    </main>
  )
}
