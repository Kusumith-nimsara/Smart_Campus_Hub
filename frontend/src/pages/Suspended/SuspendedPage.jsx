import { useNavigate } from 'react-router-dom'
import './SuspendedPage.css'

export default function SuspendedPage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('username') || 'User'

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('authRole')
    localStorage.removeItem('authApproved')
    localStorage.removeItem('username')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authLoginType')
    navigate('/')
  }

  return (
    <main className="suspended-page">
      <section className="suspended-card">
        <div className="icon">🛑</div>
        <h1>Account Suspended</h1>
        <p className="greeting">Hello, {userName}</p>
        <p className="message">
          Your account access has been revoked by the system administrator due to a policy violation or security concern.
        </p>
        <p className="sub-message">
          You cannot access the Smart Campus Hub or its services. If you believe this is an error, please contact the campus IT administration desk to appeal the suspension.
        </p>
        <div className="button-group">
          <button type="button" className="support-btn" onClick={() => window.location.href = 'mailto:support@smartcampus.edu'}>
            Contact Support
          </button>
          <button type="button" className="home-btn" onClick={handleLogout}>
            Return Home
          </button>
        </div>
      </section>
    </main>
  )
}
