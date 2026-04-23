import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import './Sidebar.css'
import { useSidebar } from '../../contexts/SidebarContext'

export default function Sidebar({ isOpen: isOpenProp, onLogout, accountName, accountRole }) {
  const navigate = useNavigate()
  const { isOpen: isOpenCtx } = useSidebar()

  const isOpen = typeof isOpenProp === 'boolean' ? isOpenProp : (typeof isOpenCtx === 'boolean' ? isOpenCtx : true)

  const name = accountName || localStorage.getItem('username') || localStorage.getItem('authEmail') || 'SmartCampusHub'
  const role = (accountRole || localStorage.getItem('authRole') || localStorage.getItem('role') || 'ADMIN').toUpperCase()

  function handleLogout() {
    clearAuthState()
    if (typeof onLogout === 'function') {
      onLogout()
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <aside className={`admin-sidebar ${!isOpen ? 'collapsed' : ''}`} aria-hidden={!isOpen}>
      <div className="admin-brand">
        <div className="admin-logo">SC</div>
        <h2>Smart Campus</h2>
      </div>

      <div className="admin-identity">
        <p className="label">Logged in as</p>
        <p className="name">{name}</p>
        <p className="role">{role}</p>
      </div>

      <nav className="admin-nav" aria-label="Main Navigation">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/user-management" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">👥</span>
          User Management
        </NavLink>
        <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📁</span>
          Resources
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">👤</span>
          Profile
        </NavLink>
        <button type="button" onClick={() => navigate('/notifications')}>
          <span className="nav-icon">🔔</span>
          Notifications
        </button>
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        ↪ Logout
      </button>
    </aside>
  )
}
