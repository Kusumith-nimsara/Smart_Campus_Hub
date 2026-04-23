import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuthState } from '../../utils/api'
import { showLogoutAlert } from '../../utils/alerts'
import './Sidebar.css'
import { useSidebar } from '../../contexts/SidebarContext'

export default function Sidebar({ isOpen: isOpenProp, onLogout, accountName, accountRole }) {
  const navigate = useNavigate()
  const { isOpen: isOpenCtx, toggle } = useSidebar()

  const isOpen = typeof isOpenProp === 'boolean' ? isOpenProp : (typeof isOpenCtx === 'boolean' ? isOpenCtx : true)

  const name = accountName || localStorage.getItem('username') || localStorage.getItem('authEmail') || 'SmartCampusHub'
  const role = (accountRole || localStorage.getItem('authRole') || localStorage.getItem('role') || 'USER').toUpperCase()
  const isAdmin = role === 'ADMIN'
  const isTechnician = role === 'TECHNICIAN' || role === 'MANAGER'

  function handleLogout() {
    clearAuthState()
    showLogoutAlert()
    if (typeof onLogout === 'function') {
      onLogout()
    } else {
      navigate('/', { replace: true })
    }
  }

  const dashboardPath = isAdmin ? '/admin-dashboard' : isTechnician ? '/technician-dashboard' : '/dashboard'

  return (
    <aside className={`admin-sidebar ${!isOpen ? 'collapsed' : ''}`} aria-hidden={!isOpen}>
      <div className="sidebar-top-row">
        <div className="admin-brand">
          <div className="admin-logo">SC</div>
          <h2>Smart Campus</h2>
        </div>
        <button type="button" className="sidebar-collapse-btn" onClick={toggle} aria-label="Collapse sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="admin-identity">
        <p className="label">Logged in as</p>
        <p className="name">{name}</p>
        <p className="role">{role}</p>
      </div>

      <nav className="admin-nav" aria-label="Main Navigation">
        <NavLink to={dashboardPath} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin/user-management" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">👥</span> User Management
          </NavLink>
        )}
        <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📁</span> Resources
        </NavLink>
        <NavLink to="/tickets" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">🎫</span> Tickets
        </NavLink>
        <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📅</span> Bookings
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">🔔</span> Notifications
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">👤</span> Profile
        </NavLink>
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        ↪ Logout
      </button>
    </aside>
  )
}
