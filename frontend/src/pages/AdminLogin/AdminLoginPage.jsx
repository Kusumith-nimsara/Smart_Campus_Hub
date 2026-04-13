import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLoginPage.css'

function normalizeRole(input) {
  if (typeof input !== 'string') {
    return ''
  }

  return input.trim().toUpperCase()
}

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

      const role = normalizeRole(data?.role)
      const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'

      if (!isAdmin) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('authRole')
        localStorage.removeItem('authApproved')
        localStorage.removeItem('username')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authLoginType')

        setResult(null)
        setMessage('Access denied: only ADMIN users can log in here. Please use User Login.')
        navigate('/unauthorized', { replace: true })
        return
      }

      const savedUsername = data?.username ?? username

      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('authToken', data.token)
      }
      localStorage.setItem('role', 'ADMIN')
      localStorage.setItem('authRole', 'ADMIN')
      localStorage.setItem('authApproved', String(typeof data?.approved === 'boolean' ? data.approved : true))
      localStorage.setItem('username', savedUsername)
      localStorage.setItem('authLoginType', 'admin')

      setResult(data)
      setMessage('Admin login successful. Redirecting...')
      navigate('/admin-dashboard', { replace: true })
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
