import { useState } from 'react'
import './RegisterPage.css'

export default function RegisterPage({ onNavigate }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('USER')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Fill details and create a new account.')
  const [result, setResult] = useState(null)

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

  async function handleRegister(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('Creating account...')

    try {
      const response = await fetch(`${backendBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          roles: [role],
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Registration failed.')
      }

      setResult(data)
      setMessage('Registration successful.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed.'
      setResult(null)
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <button type="button" className="back-link" onClick={() => onNavigate('landing')}>
          Back to Landing
        </button>

        <h1>Create Account</h1>
        <p className="register-subtitle">Register a USER or ADMIN account in Smart Campus Hub.</p>

        <form className="register-form" onSubmit={handleRegister}>
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
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
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
              minLength={6}
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              minLength={6}
              required
            />
          </label>

          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Register'}
          </button>
        </form>

        <p className="register-status">{message}</p>
        {result && <pre className="register-response">{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </main>
  )
}
