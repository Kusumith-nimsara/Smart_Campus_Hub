import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

type AuthResponse = {
  token: string
  username: string
  email: string
  roles: string[]
}

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('Use this page to test backend auth quickly.')
  const [result, setResult] = useState<AuthResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return
    }

    let cancelled = false
    const existingScript = document.getElementById('google-identity-script') as
      | HTMLScriptElement
      | null

    const initializeGoogleButton = () => {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return
      }

      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setMessage('Google login failed: no credential returned.')
            return
          }
          await loginWithGoogle(response.credential)
        },
      })

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
      })
    }

    if (existingScript) {
      initializeGoogleButton()
      return () => {
        cancelled = true
      }
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleButton
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [googleClientId])

  async function loginWithGoogle(idToken: string) {
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

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
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
          <div ref={googleButtonRef} className="google-button" aria-label="Sign in with Google" />
        ) : (
          <p className="warning">
            Add VITE_GOOGLE_CLIENT_ID to frontend/.env so Google button can render.
          </p>
        )}

        <p className="status">{message}</p>

        {result && (
          <pre className="response-panel">{JSON.stringify(result, null, 2)}</pre>
        )}

        <p className="hint">
          Backend URL: <strong>{backendBaseUrl}</strong>
        </p>
      </section>
    </main>
  )
}

export default App
