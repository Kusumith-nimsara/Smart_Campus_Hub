import { useEffect, useRef } from 'react'

export default function GoogleLoginButton({ clientId, onCredential, onError }) {
  const googleButtonRef = useRef(null)

  useEffect(() => {
    if (!clientId || !googleButtonRef.current) {
      return
    }

    let cancelled = false
    const existingScript = document.getElementById('google-identity-script')

    const initializeGoogleButton = () => {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return
      }

      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            if (onError) {
              onError('Google login failed: no credential returned.')
            }
            return
          }
          await onCredential(response.credential)
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
      if (window.google) {
        initializeGoogleButton()
      } else {
        existingScript.addEventListener('load', initializeGoogleButton, { once: true })
      }
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
  }, [clientId, onCredential, onError])

  return <div ref={googleButtonRef} className="google-button" aria-label="Sign in with Google" />
}
