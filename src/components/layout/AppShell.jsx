import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-content">
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
