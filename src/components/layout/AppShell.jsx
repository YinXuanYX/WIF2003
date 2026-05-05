import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div
        className="app-content"
        style={{
          marginLeft: collapsed
            ? 'var(--sidebar-collapsed-width)'
            : undefined,
        }}
      >
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
