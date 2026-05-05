import { Link, useLocation } from 'react-router-dom'
import useThemeStore from '../../stores/useThemeStore'
import useAuthStore from '../../stores/useAuthStore'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { path: '/cashflow', icon: '💰', label: 'Cash Flow' },
      { path: '/goals', icon: '🎯', label: 'Financial Goals' },
      { path: '/strategy', icon: '📈', label: 'Investment Strategy' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { path: '/market', icon: '🌐', label: 'Market Insights' },
      { path: '/calculator', icon: '🧮', label: 'ROI Calculator' },
    ],
  },
]

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand__icon">₿</div>
          <span>FinPlan</span>
        </Link>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sidebar-group">
              <div className="sidebar-group__label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-link__icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-link__icon">👤</span>
            {user?.name || 'Profile'}
          </Link>
          <button className="sidebar-link w-100 border-0" onClick={toggleTheme}>
            <span className="sidebar-link__icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
