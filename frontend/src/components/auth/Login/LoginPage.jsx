import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../GoogleLoginButton'
import { closeAlert, showError, showInfo, showRunning, showSuccess } from '../../../utils/alerts'
import './LoginPage.css'

function extractGoogleProfileFromJwt(idToken) {
  try {
    const payloadBase64 = idToken.split('.')[1]
    if (!payloadBase64) {
      return { email: '', name: '', picture: '' }
    }

    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    return {
      email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '',
      name: typeof payload?.name === 'string' ? payload.name.trim() : '',
      picture: typeof payload?.picture === 'string' ? payload.picture.trim() : '',
    }
  } catch {
    return { email: '', name: '', picture: '' }
  }
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082/api'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  // Debug: print runtime Vite env value for Google client id
  // Remove this in production — it's for local debugging only.
  // eslint-disable-next-line no-console
  console.log('VITE_GOOGLE_CLIENT_ID (runtime):', import.meta.env.VITE_GOOGLE_CLIENT_ID)

  async function loginWithGoogle(idToken) {
    setLoading(true)
    setMessage('Checking Google login with backend...')
    showRunning('Signing in', 'Checking Google login...')
    try {
      const response = await fetch(`${backendBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const contentType = response.headers.get('content-type') || ''
      let data = {}
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const rawBody = await response.text()
        data = rawBody ? { message: rawBody } : {}
      }

      if (!response.ok) {
        throw new Error(data?.message ?? 'Google auth failed.')
      }

      const googleProfile = extractGoogleProfileFromJwt(idToken)
      const googleEmail = googleProfile.email
      const backendEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : ''
      const effectiveEmail = googleEmail || backendEmail
      const backendRole = String(data?.role ?? '').toUpperCase()
      if (!data?.token) {
        throw new Error(data?.message ?? 'Google auth failed.')
      }
      // Trust the backend role assignment (admin email is now configured server-side)
      const role = backendRole === 'ADMIN' ? 'ADMIN' : 'USER'
      // Backend blocks pending users before issuing token. If approved is omitted, treat as approved.
      const approved = typeof data?.approved === 'boolean' ? data.approved : true
      const savedUsername = data?.username ?? googleProfile.name ?? effectiveEmail ?? ''

      localStorage.setItem('token', data.token)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('role', role)
      localStorage.setItem('authRole', role)
      localStorage.setItem('authApproved', String(approved))
      localStorage.setItem('username', savedUsername)
      localStorage.setItem('authLoginType', 'google')
      localStorage.setItem('authEmail', effectiveEmail)
      if (googleProfile.picture) {
        localStorage.setItem('authAvatarUrl', googleProfile.picture)
      } else {
        localStorage.removeItem('authAvatarUrl')
      }

      let effectiveRole = role
      let effectiveApproved = approved
      try {
        const verifyResponse = await fetch(`${backendBaseUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })

        const verifyData = await verifyResponse.json()
        if (verifyResponse.ok) {
          const verifyRole = String(verifyData?.role ?? effectiveRole).toUpperCase()
          const verifyApproved = typeof verifyData?.approved === 'boolean' ? verifyData.approved : effectiveApproved

          effectiveRole = verifyRole === 'ADMIN' ? 'ADMIN' : 'USER'
          effectiveApproved = effectiveRole === 'ADMIN' ? true : verifyApproved

          localStorage.setItem('role', effectiveRole)
          localStorage.setItem('authRole', effectiveRole)
          localStorage.setItem('authApproved', String(effectiveApproved))
          if (verifyData?.username) {
            localStorage.setItem('username', String(verifyData.username))
          }
          if (typeof verifyData?.email === 'string' && verifyData.email.trim()) {
            localStorage.setItem('authEmail', verifyData.email.trim().toLowerCase())
          }
          localStorage.setItem('authLoginType', 'google')
        }
      } catch {
        // If /user/me fails, fallback to auth response values.
      }

      if (!effectiveApproved) {
        setMessage('Your account is pending admin approval. Redirecting...')
        closeAlert()
        showInfo('Pending approval', 'Your account is waiting for admin approval.')
        navigate('/unauthorized', { replace: true })
        return
      }

      if (effectiveRole === 'ADMIN') {
        setMessage('Admin login successful. Redirecting...')
        closeAlert()
        await showSuccess('Admin login successful', 'Welcome to your dashboard.')
        navigate('/admin-dashboard', { replace: true })
        return
      }

      setMessage('Login successful. Redirecting...')
      closeAlert()
      await showSuccess('Login successful', 'Welcome back.')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google auth failed.'
      
      const isPending = errorMessage.toLowerCase().includes('pending')
      const isSuspended = errorMessage.toLowerCase().includes('suspended')
      
      if (isPending || isSuspended) {
        const googleProfile = extractGoogleProfileFromJwt(idToken)
        const googleEmail = googleProfile.email
        if (googleProfile.name) {
          localStorage.setItem('username', googleProfile.name)
        } else if (googleEmail) {
          localStorage.setItem('username', googleEmail.split('@')[0] || googleEmail)
        }
        if (googleProfile.picture) {
          localStorage.setItem('authAvatarUrl', googleProfile.picture)
        }
        if (googleEmail) {
          localStorage.setItem('authEmail', googleEmail)
        }
        
        if (isSuspended) {
          setMessage('Your account is suspended. Redirecting...')
          closeAlert()
          showInfo('Account suspended', 'Your account has been suspended. Contact administration for help.')
          setTimeout(() => navigate('/suspended', { replace: true }), 1500)
        } else {
          setMessage('Your account is pending admin approval. Redirecting...')
          closeAlert()
          showInfo('Pending approval', 'Your account is waiting for admin approval.')
          setTimeout(() => navigate('/unauthorized', { replace: true }), 1500)
        }
        return
      }

      setMessage(errorMessage)
      closeAlert()
      showError('Login failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function loginWithLocal(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password.')
      return
    }

    setLoading(true)
    setMessage('Signing in...')
    showRunning('Signing in', 'Validating credentials...')
    
    try {
      const response = await fetch(`${backendBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const contentType = response.headers.get('content-type') || ''
      let data = {}
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const rawBody = await response.text()
        data = rawBody ? { message: rawBody } : {}
      }

      if (!response.ok) {
        throw new Error(data?.message ?? 'Login failed.')
      }

      const role = String(data?.role ?? 'USER').toUpperCase()
      const approved = typeof data?.approved === 'boolean' ? data.approved : true

      localStorage.setItem('token', data.token)
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('role', role)
      localStorage.setItem('authRole', role)
      localStorage.setItem('authApproved', String(approved))
      localStorage.setItem('username', data.username ?? username)
      localStorage.setItem('authEmail', data.email ?? username)
      localStorage.setItem('authLoginType', 'local')

      if (!approved) {
        setMessage('Your account is pending admin approval.')
        closeAlert()
        showInfo('Pending approval', 'Your account is waiting for admin approval.')
        navigate('/unauthorized', { replace: true })
        return
      }

      if (role === 'ADMIN') {
        setMessage('Admin login successful.')
        closeAlert()
        await showSuccess('Admin login successful', 'Welcome to your dashboard.')
        navigate('/admin-dashboard', { replace: true })
        return
      }

      setMessage('Login successful.')
      closeAlert()
      await showSuccess('Login successful', 'Welcome back.')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed.'
      
      const isSuspended = errorMessage.toLowerCase().includes('suspended')
      const isPending = errorMessage.toLowerCase().includes('pending')
      
      if (isSuspended || isPending) {
        localStorage.setItem('username', username)
        if (isSuspended) {
          setMessage('Your account is suspended.')
          closeAlert()
          showInfo('Account suspended', 'Your account has been suspended. Contact administration.')
          setTimeout(() => navigate('/suspended', { replace: true }), 1500)
        } else {
          setMessage('Your account is pending admin approval.')
          closeAlert()
          showInfo('Pending approval', 'Your account is waiting for admin approval.')
          setTimeout(() => navigate('/unauthorized', { replace: true }), 1500)
        }
        return
      }

      setMessage(errorMessage)
      closeAlert()
      showError('Login failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <article className="auth-hero">
          <p className="chip">Smart Campus</p>
          <h1>
            Campus Management,
            <span> Simplified</span>
          </h1>
          <p className="subtitle">
            A comprehensive platform for resources, bookings, maintenance, and announcements across campus.
          </p>

          <div className="hero-grid">
            <div className="hero-item">
              <h3>Smart Booking</h3>
              <p>Reserve venues and resources without delays.</p>
            </div>
            <div className="hero-item">
              <h3>Maintenance</h3>
              <p>Track and manage maintenance tickets quickly.</p>
            </div>
            <div className="hero-item">
              <h3>Resources</h3>
              <p>Handle campus inventory with clarity.</p>
            </div>
            <div className="hero-item">
              <h3>Notifications</h3>
              <p>Stay updated with real-time campus events.</p>
            </div>
          </div>
        </article>

        <article className="auth-card">
          <button type="button" className="auth-back-link" onClick={() => navigate('/')}>
            Back
          </button>

          <h2>Welcome Back</h2>
          <p className="auth-note">Sign in to access your Smart Campus dashboard.</p>

          <form className="local-login-form" onSubmit={loginWithLocal}>
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="login-btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          {googleClientId ? (
            <div className="google-button-container">
              <GoogleLoginButton
                clientId={googleClientId}
                onCredential={loginWithGoogle}
                onError={(errorText) => {
                  const nextMessage =
                    typeof errorText === 'string' && errorText.trim()
                      ? errorText
                      : 'Google sign-in failed.'
                  setMessage(nextMessage)
                  showError('Google sign-in error', nextMessage)
                }}
              />
            </div>
          ) : (
            <p className="warning">
              Add VITE_GOOGLE_CLIENT_ID to .env so Google button can render.
              <br />
              <small>
                Runtime value: <strong>{String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '(empty)')}</strong>
              </small>
            </p>
          )}

          <p className="status">{message}</p>
          
          <p className="auth-register-link">
            Don't have an account? <button type="button" onClick={() => navigate('/register')} className="btn-link">Register here</button>
          </p>

        </article>
      </section>
    </main>
  )
}
