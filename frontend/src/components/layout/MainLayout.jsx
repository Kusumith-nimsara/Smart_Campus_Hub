import React from 'react'
import Sidebar from '../common/Sidebar'
import { useSidebar } from '../../contexts/SidebarContext'

export default function MainLayout({ pageClass = '', children }) {
  const { isOpen } = useSidebar()
  const mainClass = `${pageClass} ${!isOpen ? 'sidebar-collapsed' : ''}`.trim()

  return (
    <main className={mainClass}>
      <Sidebar />
      {children}
    </main>
  )
}
