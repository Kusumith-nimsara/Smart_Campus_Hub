import React, { createContext, useContext, useEffect, useState } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const v = localStorage.getItem('sidebarOpen')
      return v === null ? true : v === 'true'
    } catch (e) {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', String(isOpen))
    } catch (e) {
      // ignore localStorage write errors
    }
  }, [isOpen])

  const toggle = () => setIsOpen((s) => !s)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    return { isOpen: true, setIsOpen: () => {}, toggle: () => {} }
  }
  return ctx
}
