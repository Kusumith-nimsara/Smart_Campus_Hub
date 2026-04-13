import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../GoogleLoginButton'
import './LoginPage.css'

function extractEmailFromJwt(idToken) {
  try {
    const payloadBase64 = idToken.split('.')[1]
    if (!payloadBase64) {
      return ''
    }

    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    return typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
  } catch {
    return ''
  }
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [message, setMessage] = useState('Continue with Google to sign in.')
  const [loading, setLoading] = useState(false)

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

  async function loginWithGoogle(idToken) {
    setLoading(true)
    setMessage('Checking Google login with backend...')
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

      const googleEmail = extractEmailFromJwt(idToken)
      const backendEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : ''
      const effectiveEmail = googleEmail || backendEmail
      const backendRole = String(data?.role ?? '').toUpperCase()
      // Trust the backend role assignment (admin email is now configured server-side)
      const role = backendRole === 'ADMIN' ? 'ADMIN' : 'USER'
      const approved = typeof data?.approved === 'boolean' ? data.approved : role === 'ADMIN'
      const savedUsername = data?.username ?? effectiveEmail ?? ''

      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('authToken', data.token)
      }
      localStorage.setItem('role', role)
      localStorage.setItem('authRole', role)
      localStorage.setItem('authApproved', String(approved))
      localStorage.setItem('username', savedUsername)
      localStorage.setItem('authLoginType', role === 'ADMIN' ? 'admin' : 'user')

      let effectiveRole = role
      let effectiveApproved = approved
      if (data?.token) {
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
            localStorage.setItem('authLoginType', effectiveRole === 'ADMIN' ? 'admin' : 'user')
          }
        } catch {
          // If /user/me fails, fallback to auth response values.
        }
      }

      if (!effectiveApproved) {
        setMessage('Your account is pending admin approval. Redirecting...')
        navigate('/unauthorized', { replace: true })
        return
      }

      if (effectiveRole === 'ADMIN') {
        setMessage('Admin login successful. Redirecting...')
        navigate('/admin-dashboard', { replace: true })
        return
      }

      setMessage('Login successful. Redirecting...')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google auth failed.'
      setMessage(errorMessage)
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
          <p className="auth-note">Sign in with Google to access your Smart Campus dashboard.</p>

          {googleClientId ? (
            <GoogleLoginButton
              clientId={googleClientId}
              onCredential={loginWithGoogle}
              onError={setMessage}
            />
          ) : (
            <p className="warning">Add VITE_GOOGLE_CLIENT_ID to .env so Google button can render.</p>
          )}

          <p className="status">{message}</p>

          <p className="hint">API: {backendBaseUrl}</p>
        </article>
      </section>
    </main>
  )
}
