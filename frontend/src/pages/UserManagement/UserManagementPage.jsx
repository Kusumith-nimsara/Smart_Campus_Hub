import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { confirmAction, showError, showToast } from '../../utils/alerts'
import './UserManagementPage.css'

const TABS = [
  { key: 'all', label: 'All Users' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'managers', label: 'Managers' },
  { key: 'technicians', label: 'Technicians' },
]

const ROLES = ['USER', 'ADMIN', 'MANAGER', 'TECHNICIAN']
const USER_TYPES = ['STUDENT', 'LECTURER', 'STAFF', 'OTHER']

export default function UserManagementPage() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || ''
  const adminName = localStorage.getItem('username') || 'Admin'
  const isGoogleLogin = localStorage.getItem('authLoginType') === 'google'
  const googleAvatarUrl = localStorage.getItem('authAvatarUrl') || ''
  const googleEmail = localStorage.getItem('authEmail') || ''
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const googleAvatarCandidate =
    googleAvatarUrl ||
    (googleEmail ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(googleEmail)}?sz=128` : '')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? 'Failed to load users')
      setUsers(Array.isArray(data) ? data : (data?.content ? data.content : []))
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    let result = users

    if (activeTab === 'pending') {
      result = result.filter((u) => !u.approved)
    } else if (activeTab === 'managers') {
      result = result.filter((u) => u.role === 'MANAGER')
    } else if (activeTab === 'technicians') {
      result = result.filter((u) => u.role === 'TECHNICIAN')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (u) =>
          (u.firstName || '').toLowerCase().includes(q) ||
          (u.lastName || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [users, activeTab, searchQuery])

  function getTabCount(key) {
    if (key === 'all') return users.length
    if (key === 'pending') return users.filter((u) => !u.approved).length
    if (key === 'managers') return users.filter((u) => u.role === 'MANAGER').length
    if (key === 'technicians') return users.filter((u) => u.role === 'TECHNICIAN').length
    return 0
  }

  async function handleApprove(userId) {
    setProcessingId(userId)
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? 'Failed to approve')
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)))
      showToast('User approved')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Failed to approve user'
      showError('Action failed', message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleToggleSuspend(userId, currentlySuspended) {
    setProcessingId(userId)
    const action = currentlySuspended ? 'unsuspend' : 'suspend'
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? `Failed to ${action}`)
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)))
      showToast(currentlySuspended ? 'User activated' : 'User suspended')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : `Failed to ${action} user`
      showError('Action failed', message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleSaveRole(userId) {
    if (!editRole) return
    setProcessingId(userId)
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? 'Failed to update role')
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)))
      setEditingUserId(null)
      setEditRole('')
      showToast('Role updated')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Failed to update role'
      showError('Update failed', message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleUserTypeChange(userId, nextUserType) {
    if (!nextUserType) return
    const previousUser = users.find((u) => u.id === userId)
    const previousUserType = previousUser?.userType

    // Optimistically reflect the selected type immediately in the UI.
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, userType: nextUserType } : u))
    )
    setProcessingId(userId)
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType: nextUserType }),
      })

      const contentType = res.headers.get('content-type') || ''
      let data = {}
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        const raw = await res.text()
        data = raw ? { message: raw } : {}
      }

      if (!res.ok) throw new Error(data?.message ?? 'Failed to update user type')
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)))
      setActionMessage(`User type updated to ${nextUserType}.`)
      showToast(`User type: ${nextUserType}`)
    } catch (err) {
      // Revert optimistic update when save fails.
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, userType: previousUserType } : u))
      )
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user type'
      setActionMessage(errorMessage)
      console.error(err)
      showError('Update failed', errorMessage)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(userId) {
    const confirmed = await confirmAction({
      title: 'Delete user?',
      text: 'This action cannot be undone.',
      confirmText: 'Delete',
    })
    if (!confirmed) return
    setProcessingId(userId)
    try {
      const res = await fetch(`${backendBaseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message ?? 'Failed to delete')
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      showToast('User deleted')
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Failed to delete user'
      showError('Delete failed', message)
    } finally {
      setProcessingId(null)
    }
  }

  function startEditRole(user) {
    setEditingUserId(user.id)
    setEditRole(user.role)
  }

  function cancelEdit() {
    setEditingUserId(null)
    setEditRole('')
  }

  function getDisplayName(user) {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    if (user.username) return user.username
    return 'Unknown'
  }

  function getStatusLabel(user) {
    if (user.suspended) return 'Suspended'
    if (!user.approved) return 'Pending'
    return 'Active'
  }

  function getStatusClass(user) {
    if (user.suspended) return 'status-suspended'
    if (!user.approved) return 'status-pending'
    return 'status-active'
  }

  function getUserTypeLabel(user) {
    const explicitType = typeof user?.userType === 'string' ? user.userType.trim() : ''
    if (explicitType) return explicitType.toUpperCase()

    const role = String(user?.role || '').toUpperCase()
    if (role === 'ADMIN' || role === 'MANAGER' || role === 'TECHNICIAN') {
      return role
    }

    return user?.registrationNumber ? 'STUDENT' : 'USER'
  }

  function getUserTypeValue(user) {
    const explicitType = typeof user?.userType === 'string' ? user.userType.trim().toUpperCase() : ''
    if (USER_TYPES.includes(explicitType)) {
      return explicitType
    }

    const derived = getUserTypeLabel(user)
    if (USER_TYPES.includes(derived)) {
      return derived
    }

    return 'OTHER'
  }

  function handleLogout() {
    clearAuthState()
    setIsAccountMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <main className={`um-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <aside className="um-sidebar" aria-hidden={!isSidebarOpen}>
        <div className="um-brand">
          <div className="um-logo">SC</div>
          <h2>Smart Campus</h2>
        </div>

        <div className="um-identity">
          <p className="um-label">Logged in as</p>
          <p className="um-name">{adminName}</p>
          <p className="um-role">ADMIN</p>
        </div>

        <nav className="um-nav" aria-label="Admin Navigation">
          <button type="button" onClick={() => navigate('/admin-dashboard')}>
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button type="button" className="active" onClick={() => navigate('/admin/user-management')}>
            <span className="nav-icon">👥</span> User Management
          </button>
          <button type="button" onClick={() => navigate('/profile')}>
            <span className="nav-icon">👤</span> Profile
          </button>
          <button type="button">
            <span className="nav-icon">🔔</span> Notifications
          </button>
        </nav>

        <button type="button" className="um-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <section className="um-content">
        <header className="um-topbar">
          <div className="topbar-left">
            <button 
              type="button" 
              className="sidebar-toggle-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
            <div>
              <h1 className="um-topbar-name">{adminName}</h1>
              <p className="um-topbar-date">{today}</p>
            </div>
          </div>
          <div className="um-account-menu">
            <button
              type="button"
              className="um-account-trigger"
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              aria-label="Open account menu"
            >
              <div className="um-topbar-avatar">
                <span>
                  {isGoogleLogin && googleAvatarCandidate && !avatarLoadFailed ? (
                    <img
                      src={googleAvatarCandidate}
                      alt={adminName}
                      className="um-topbar-avatar-image"
                      onError={() => setAvatarLoadFailed(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    adminName.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="um-topbar-info">
                  <p className="um-topbar-uname">{adminName}</p>
                  <p className="um-topbar-urole">
                    ADMIN
                    {isGoogleLogin && (
                      <span className="um-login-provider" aria-label="Signed in with Google">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.8 2.6 12s4.2 9.5 9.4 9.5c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z"/>
                          <path fill="#34A853" d="M3.7 7.6l3.2 2.3c.9-1.8 2.8-3 5.1-3 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 8.4 2.5 5.3 4.6 3.7 7.6z"/>
                          <path fill="#4A90E2" d="M12 21.5c2.5 0 4.7-.8 6.3-2.2l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.8 0-5.2-2.5-5.4-3.8l-3.2 2.5c1.6 3 4.7 4.8 8.6 4.8z"/>
                          <path fill="#FBBC05" d="M3.7 16.7l3.2-2.5c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L3.7 7.6C3 8.9 2.6 10.4 2.6 12s.4 3.1 1.1 4.7z"/>
                        </svg>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </button>

            {isAccountMenuOpen && (
              <div className="um-account-dropdown" role="menu" aria-label="Account actions">
                <button type="button" onClick={handleLogout} role="menuitem">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="um-main">
          <div className="um-header">
            <h2>User Management</h2>
            <p className="um-subtitle">Manage user roles and account approvals</p>
          </div>

          <div className="um-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`um-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({getTabCount(tab.key)})
              </button>
            ))}
          </div>

          <div className="um-search-wrapper">
            <input
              type="text"
              className="um-search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="um-table-container">
            {loading ? (
              <div className="um-loading">
                <div className="um-spinner" />
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="um-empty">
                <p>No users found.</p>
              </div>
            ) : (
              <>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>USER TYPE</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="um-user-cell">
                            <p className="um-user-name">{getDisplayName(user)}</p>
                            <p className="um-user-email">{user.email || 'No email'}</p>
                          </div>
                        </td>
                        <td>
                          <select
                            className="um-user-type-select"
                            value={getUserTypeValue(user)}
                            onChange={(e) => handleUserTypeChange(user.id, e.target.value)}
                            disabled={processingId === user.id}
                            aria-label="User type"
                          >
                            {USER_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span className={`um-role-badge role-${(user.role || 'USER').toLowerCase()}`}>
                            {user.role || 'USER'}
                          </span>
                        </td>
                        <td>
                          <span className={`um-status-badge ${getStatusClass(user)}`}>
                            {getStatusLabel(user)}
                          </span>
                        </td>
                        <td>
                          <div className="um-actions">
                            {editingUserId === user.id ? (
                              <div className="um-edit-role-group">
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="um-role-select"
                                >
                                  {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="um-btn save"
                                  onClick={() => handleSaveRole(user.id)}
                                  disabled={processingId === user.id}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="um-btn cancel"
                                  onClick={cancelEdit}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="um-btn edit"
                                  onClick={() => startEditRole(user)}
                                >
                                  Edit Role
                                </button>
                                {!user.approved && (
                                  <button
                                    type="button"
                                    className="um-btn approve"
                                    onClick={() => handleApprove(user.id)}
                                    disabled={processingId === user.id}
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className={`um-btn ${user.suspended ? 'unsuspend' : 'suspend'}`}
                                  onClick={() => handleToggleSuspend(user.id, user.suspended)}
                                  disabled={processingId === user.id}
                                >
                                  {user.suspended ? 'Activate' : 'Suspend'}
                                </button>
                                <button
                                  type="button"
                                  className="um-btn delete"
                                  onClick={() => handleDelete(user.id)}
                                  disabled={processingId === user.id}
                                  title="Delete user"
                                >
                                  🗑
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="um-footer-info">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
                {actionMessage && <p className="um-action-message">{actionMessage}</p>}
              </>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
