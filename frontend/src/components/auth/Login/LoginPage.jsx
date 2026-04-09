import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../GoogleLoginButton'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('Sign in with your user account.')
  const [result, setResult] = useState(null)
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

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Google auth failed.')
      }

      if (data?.token) {
        localStorage.setItem('authToken', data.token)
      }
      localStorage.setItem('authRoles', JSON.stringify(Array.isArray(data?.roles) ? data.roles : ['USER']))
      localStorage.setItem('authLoginType', 'user')

      setResult(data)
      setMessage('Google auth succeeded. Backend token received.')
      window.alert('Login successful')
      navigate('/profile')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google auth failed.'
      setResult(null)
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordLogin(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('Checking username/password login...')
    try {
      const response = await fetch(`${backendBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Login failed.')
      }

      if (data?.token) {
        localStorage.setItem('authToken', data.token)
      }
      localStorage.setItem('authRoles', JSON.stringify(Array.isArray(data?.roles) ? data.roles : ['USER']))
      localStorage.setItem('authLoginType', 'user')

      setResult(data)
      setMessage('Username/password login succeeded.')
      window.alert('Login successful')
      navigate('/profile')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed.'
      setResult(null)
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button type="button" className="auth-back-link" onClick={() => navigate('/')}>
          Back to Landing
        </button>

        <p className="chip">Smart Campus Hub</p>
        <h1>User Login</h1>
        <p className="subtitle">This page is for student/user login. Admins should use Admin Login.</p>

        <button type="button" className="auth-admin-link" onClick={() => navigate('/admin-login')}>
          Go to Admin Login
        </button>

        <form onSubmit={handlePasswordLogin} className="form-grid">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        <div className="divider">or</div>

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

        {result && <pre className="response-panel">{JSON.stringify(result, null, 2)}</pre>}

        <p className="hint">
          Backend URL: <strong>{backendBaseUrl}</strong>
        </p>
      </section>
    </main>
  )
}
