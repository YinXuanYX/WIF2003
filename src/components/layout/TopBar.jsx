import { useLocation } from 'react-router-dom'
import useThemeStore from '../../stores/useThemeStore'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/cashflow': 'Cash Flow',
  '/goals': 'Financial Goals',
  '/strategy': 'Investment Strategy',
  '/market': 'Market Insights',
  '/calculator': 'ROI Calculator',
  '/profile': 'Profile',
}

function TopBar({ onToggleSidebar }) {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const title = PAGE_TITLES[location.pathname] || 'FinPlan'

  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          <span className="topbar-breadcrumb">
            Home {location.pathname !== '/dashboard' && `/ ${title}`}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}

export default TopBar
