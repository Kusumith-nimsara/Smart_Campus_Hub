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
  const [roles, setRoles] = useState(() => {
    try {
      const raw = localStorage.getItem('authRoles')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

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
        const loadedRoles = Array.isArray(data.roles) ? data.roles : roles
        setRoles(loadedRoles)
        localStorage.setItem('authRoles', JSON.stringify(loadedRoles))
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
      const updatedRoles = Array.isArray(data.roles) ? data.roles : roles
      setRoles(updatedRoles)
      localStorage.setItem('authRoles', JSON.stringify(updatedRoles))
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

      localStorage.removeItem('authToken')
      localStorage.removeItem('authRoles')
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
    localStorage.removeItem('authToken')
    localStorage.removeItem('authRoles')
    localStorage.removeItem('authLoginType')
    navigate('/login')
  }

  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')
  const loginType = isAdmin ? 'ADMIN' : 'USER'

  return (
    <main className="profile-page">
      <section className="profile-card">
        <button type="button" className="profile-back-link" onClick={() => navigate('/')}>
          Back to Landing
        </button>

        <h1>Edit Profile</h1>
        <p className="profile-subtitle">Update your details and manage your account.</p>
        <p className={`profile-login-type ${isAdmin ? 'admin' : 'user'}`}>
          Login successful as {loginType}
        </p>

        {loading ? (
          <p className="profile-status">Loading...</p>
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
              <button type="button" className="secondary" onClick={handleLogout} disabled={saving || deleting}>
                Logout
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
      </section>
    </main>
  )
}
