import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeAlert, showError, showRunning, showSuccess } from '../../utils/alerts'
import '../Landing/LandingPage.css'
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

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      const err = 'First and Last name must be at least 2 characters.'
      setMessage(err)
      showError('Validation failed', err)
      return
    }
    if (username.trim().length < 3) {
      const err = 'Username must be at least 3 characters.'
      setMessage(err)
      showError('Validation failed', err)
      return
    }
    if (registrationNumber.trim().length < 3) {
      const err = 'Registration Number must be at least 3 characters.'
      setMessage(err)
      showError('Validation failed', err)
      return
    }
    const phoneRegex = /^\+?[0-9\s-]{7,20}$/
    if (!phoneRegex.test(mobileNumber.trim())) {
      const err = 'Please enter a valid mobile number.'
      setMessage(err)
      showError('Validation failed', err)
      return
    }
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passRegex.test(password)) {
      const err = 'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 digit.'
      setMessage(err)
      showError('Validation failed', err)
      return
    }
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
    <main className="landing-page register-layout-wrapper">
      {/* Animated background orbs from landing page */}
      <div className="landing-orb orb-1" />
      <div className="landing-orb orb-2" />
      <div className="landing-orb orb-3" />

      <section className="register-card modern-glass-card">
        <button type="button" className="back-link" onClick={() => navigate('/')}>
          ← Back to Landing
        </button>

        <h1>Create Account</h1>
        <p className="register-subtitle">Create a standard user account in Smart Campus Hub.</p>

        <form className="register-form modern-form-grid" onSubmit={handleRegister}>
          <label className="form-group-full">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              minLength={3}
              maxLength={50}
              required
            />
          </label>

          <label className="form-group-full">
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
              minLength={2}
              maxLength={50}
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
              minLength={2}
              maxLength={50}
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
              minLength={3}
              maxLength={50}
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
              minLength={7}
              maxLength={20}
              pattern="^\+?[0-9\s-]{7,20}$"
              title="Enter a valid mobile number (e.g. +94771234567)"
              required
            />
          </label>

          <label className="form-group-full">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 lowercase, 1 digit"
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one number, one uppercase and lowercase letter, and at least 8 characters"
              required
            />
          </label>

          <label className="form-group-full">
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              minLength={8}
              required
            />
          </label>

          <button type="submit" className="btn-modern-primary form-group-full" disabled={loading}>
            {loading ? 'Please wait...' : 'Register'}
          </button>
        </form>

        {message && <p className="register-status modern-status">{message}</p>}
        {result && <pre className="register-response">{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </main>
  )
}
