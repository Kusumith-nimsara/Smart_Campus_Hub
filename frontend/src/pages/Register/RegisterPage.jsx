import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeAlert, showError, showRunning, showSuccess } from '../../utils/alerts'
import './RegisterPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Fill details and create a new account.')
  const [result, setResult] = useState(null)

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

  async function handleRegister(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      showError('Validation failed', 'Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('Creating account...')
    showRunning('Creating account', 'Please wait while we register your profile...')

    try {
      const response = await fetch(`${backendBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          firstName,
          lastName,
          registrationNumber,
          mobileNumber,
          password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message ?? 'Registration failed.')
      }

      if (data?.token) {
        localStorage.setItem('authToken', data.token)
      }

      setResult(data)
      setMessage('Registration successful.')
      closeAlert()
      await showSuccess('Registration successful', 'Your account has been created.')
      navigate('/profile')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed.'
      setResult(null)
      setMessage(errorMessage)
      closeAlert()
      showError('Registration failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <button type="button" className="back-link" onClick={() => navigate('/')}>
          Back to Landing
        </button>

        <h1>Create Account</h1>
  <p className="register-subtitle">Create a standard user account in Smart Campus Hub.</p>

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
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Enter first name"
              required
            />
          </label>

          <label>
            Last Name
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Enter last name"
              required
            />
          </label>

          <label>
            Registration Number
            <input
              type="text"
              value={registrationNumber}
              onChange={(event) => setRegistrationNumber(event.target.value)}
              placeholder="Enter registration number"
              required
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              placeholder="Enter mobile number"
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
