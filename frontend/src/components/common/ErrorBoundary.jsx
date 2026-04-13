import { Component } from 'react'

/**
 * React Error Boundary — catches rendering errors in child components
 * and shows a friendly fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <main
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#0f1117',
            color: '#e4e6eb',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            padding: '2rem',
          }}
        >
          <section
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '3rem',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  color: '#f87171',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '120px',
                  marginBottom: '1.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message || 'Unknown error'}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  color: '#e4e6eb',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Go Home
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
