import { Link, useLocation, useNavigate } from 'react-router-dom'
import PigIcon from '../../assets/PigIcon.png'
import useThemeStore from '../../stores/useThemeStore'
import useAuthStore from '../../stores/authStore'
import { authApi } from '../../utils/api'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { path: '/cashflow', icon: 'bi-wallet2', label: 'Cash Flow' },
      { path: '/goals', icon: 'bi-bullseye', label: 'Financial Goals' },
      { path: '/strategy', icon: 'bi-graph-up-arrow', label: 'Investment Strategy' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { path: '/market', icon: 'bi-globe-americas', label: 'Market Insights' },
      { path: '/calculator', icon: 'bi-calculator', label: 'ROI Calculator' },
    ],
  },
]

function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authApi.logout()
    clearUser()
    navigate('/login')
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'show' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand-row">
          {!collapsed && (
            <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
              <div className="sidebar-brand__icon">
                <img src={PigIcon} alt="FinPlan" />
              </div>
              <span>FinPlan</span>
            </Link>
          )}
          <button
            className={`sidebar-collapse-btn d-none d-lg-flex ${collapsed ? 'mx-auto' : ''}`}
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar width"
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sidebar-group">
              {!collapsed && <div className="sidebar-group__label">{group.label}</div>}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-link__icon">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  {!collapsed && <span className="sidebar-link__label">{item.label}</span>}
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
            title={collapsed ? (user?.name || 'Profile') : undefined}
          >
            <span className="sidebar-link__icon">
              <i className="bi bi-person-circle" />
            </span>
            {!collapsed && <span className="sidebar-link__label">{user?.name || 'Profile'}</span>}
          </Link>
          <button
            className="sidebar-link sidebar-action"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="sidebar-link__icon">
              <i className="bi bi-box-arrow-left" />
            </span>
            {!collapsed && <span className="sidebar-link__label">Logout</span>}
          </button>
          <button
            className="sidebar-link sidebar-action"
            onClick={toggleTheme}
            title={collapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            <span className="sidebar-link__icon">
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
            </span>
            {!collapsed && (
              <span className="sidebar-link__label">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
