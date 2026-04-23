import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import {
  closeAlert,
  confirmAction,
  showError,
  showInfo,
  showLogoutAlert,
  showRunning,
  showSuccess,
} from '../../utils/alerts'
import './ProfilePage.css'
import { useSidebar } from '../../contexts/SidebarContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082/api'
  const token = useMemo(() => localStorage.getItem('authToken') ?? '', [])
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const { isOpen, toggle } = useSidebar()
  const [role, setRole] = useState(() => (localStorage.getItem('authRole') || localStorage.getItem('role') || 'USER'))
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

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
        showInfo('Session expired', 'Please login again to continue.')
        navigate('/login', { replace: true })
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
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile.'
        setMessage(errorMessage)
        showError('Profile load failed', errorMessage)
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
    showRunning('Saving profile', 'Updating your profile details...')

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
      closeAlert()
      showSuccess('Success', 'Profile updated successfully.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.'
      setMessage(errorMessage)
      closeAlert()
      showError('Update failed', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await confirmAction({
      title: 'Delete account?',
      text: 'This action cannot be undone.',
      confirmText: 'Delete',
    })
    if (!confirmed) {
      return
    }

    setDeleting(true)
    setMessage('Deleting account...')
    showRunning('Deleting account', 'Please wait while we remove your account...')

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

      clearAuthState()
      setMessage('Account deleted successfully.')
      closeAlert()
      await showSuccess('Account deleted', 'Your account has been removed successfully.')
      navigate('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account.'
      setMessage(errorMessage)
      closeAlert()
      showError('Delete failed', errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    showLogoutAlert()
    navigate('/', { replace: true })
  }

  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
  const loginType = isAdmin ? 'ADMIN' : 'USER'
  const fullName = `${firstName} ${lastName}`.trim() || username || 'Campus User'
  const googleAvatarCandidate =
    googleAvatarUrl ||
    (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <section className="profile-content">
      <header className="profile-topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            type="button" 
            className="sidebar-toggle-btn" 
            onClick={toggle}
            aria-label={isOpen ? 'Collapse sidebar' : 'Open sidebar'}
          >
            ☰
          </button>
          <div>
            <h1>Welcome back, {firstName || username || 'User'}!</h1>
            <p>{today}</p>
          </div>
        </div>
          <div className="topbar-right">
            <div className="profile-account-menu">
              <button
                type="button"
                className="profile-account-trigger"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-label="Open account menu"
              >
                <div className="profile-topbar-user">
                  <span>
                    {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                      <img
                        src={googleAvatarCandidate}
                        alt={fullName}
                        className="profile-topbar-avatar-image"
                        onError={() => setAvatarLoadFailed(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (fullName || username || 'U').charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="profile-topbar-uname">{fullName}</p>
                    <p className="profile-topbar-urole">
                      {loginType}
                      {isGoogleLogin && (
                        <span className="profile-login-provider" aria-label="Signed in with Google">
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.8 2.6 12s4.2 9.5 9.4 9.5c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z"/>
                            <path fill="#34A853" d="M3.7 7.6l3.2 2.3c.9-1.8 2.8-3 5.1-3 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 8.4 2.5 5.3 4.6 3.7 7.6z"/>
                            <path fill="#4A90E2" d="M12 21.5c2.5 0 4.7-.8 6.3-2.2l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.8 0-5.2-2.5-5.4-3.8l-3.2 2.5c1.6 3 4.7 4.8 8.6 4.8z"/>
                            <path fill="#FBBC05" d="M3.7 16.7l3.2-2.5c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L3.7 7.6C3 8.9 2.6 10.4 2.6 12s.4 3.1 1.1 4.7z"/>
                          </svg>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="profile-account-dropdown" role="menu" aria-label="Account actions">
                  <button type="button" onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
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
            <button type="button" onClick={() => navigate('/resources')}>Resources</button>
            <button type="button" onClick={() => navigate('/bookings')}>Bookings</button>
            <button type="button" onClick={() => navigate('/tickets')}>Tickets</button>
          </article>
        </div>
      </section>
  )
}
