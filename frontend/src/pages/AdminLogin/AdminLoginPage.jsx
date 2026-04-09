import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLoginPage.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Sign in with your admin account.')
  const [result, setResult] = useState(null)

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

  async function handleAdminLogin(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('Verifying admin login...')

    try {
      const response = await fetch(`${backendBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Admin login failed.')
      }

      const roles = Array.isArray(data?.roles) ? data.roles : []
      const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')

      if (!isAdmin) {
        setResult(data)
        setMessage('Login worked, but this account is not ADMIN.')
        return
      }

      setResult(data)
      setMessage('Admin login successful.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin login failed.'
      setResult(null)
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-card">
        <button type="button" className="back-link" onClick={() => navigate('/')}>
          Back to Landing
        </button>

        <h1>Admin Login</h1>
        <p className="admin-subtitle">Only accounts with ADMIN role should continue.</p>

        <form className="admin-form" onSubmit={handleAdminLogin}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter admin username"
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
            {loading ? 'Please wait...' : 'Login as Admin'}
          </button>
        </form>

        <p className="admin-status">{message}</p>
        {result && <pre className="admin-response">{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </main>
  )
}
