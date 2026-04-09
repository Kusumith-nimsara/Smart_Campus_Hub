import { useState } from 'react'
import GoogleLoginButton from '../GoogleLoginButton'
import './LoginPage.css'

export default function LoginPage({ onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('Use this page to test backend auth quickly.')
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

      setResult(data)
      setMessage('Google auth succeeded. Backend token received.')
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

      setResult(data)
      setMessage('Username/password login succeeded.')
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
        {typeof onNavigate === 'function' && (
          <button type="button" className="auth-back-link" onClick={() => onNavigate('landing')}>
            Back to Landing
          </button>
        )}

        <p className="chip">Smart Campus Hub</p>
        <h1>Auth Verification</h1>
        <p className="subtitle">Use this form to verify backend login and Google auth.</p>

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
            {loading ? 'Please wait...' : 'Test Password Login'}
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
