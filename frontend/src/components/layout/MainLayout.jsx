import React from 'react'
import Sidebar from '../common/Sidebar'
import { useSidebar } from '../../contexts/SidebarContext'

export default function MainLayout({ pageClass = '', children }) {
  const { isOpen, toggle } = useSidebar()
  const mainClass = `main-layout ${pageClass} ${!isOpen ? 'sidebar-collapsed' : ''}`.trim()

  return (
    <main className={mainClass}>
      <Sidebar />
      <div className="main-content-area">
        {!isOpen && (
          <button
            type="button"
            className="sidebar-float-toggle"
            onClick={toggle}
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        {children}
      </div>
    </main>
  )
}
