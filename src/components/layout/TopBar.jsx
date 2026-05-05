import { useLocation } from 'react-router-dom'
import useThemeStore from '../../stores/useThemeStore'
import useAuthStore from '../../stores/useAuthStore'

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
  const user = useAuthStore((s) => s.user)
  const title = PAGE_TITLES[location.pathname] || 'FinPlan'

  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="topbar-hamburger d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            {location.pathname !== '/dashboard' && (
              <>
                <span className="topbar-breadcrumb__sep">/</span>
                <span className="topbar-breadcrumb__current">{title}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {user && (
          <div className="topbar-avatar" title={user.name}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
        </button>
      </div>
    </header>
  )
}

export default TopBar
