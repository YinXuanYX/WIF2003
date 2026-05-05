import { Link, useLocation } from "react-router-dom";
import useThemeStore from "../stores/useThemeStore";

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const isActive = (path) =>
    location.pathname === path ? "nav-link active fw-semibold" : "nav-link";

  return (
    <nav className="navbar navbar-dark bg-dark shadow-sm px-3">
      <Link className="navbar-brand fw-bold" to="/dashboard">
        💰 FinPlan
      </Link>

      <ul className="navbar-nav me-auto d-flex flex-row gap-3">
        <li className="nav-item">
          <Link className={isActive("/dashboard")} to="/dashboard">
            Dashboard
          </Link>
        </li>

        <li className="nav-item">
          <Link className={isActive("/goals")} to="/goals">
            Financial Goals
          </Link>
        </li>

        <li className="nav-item">
          <Link className={isActive("/strategy")} to="/strategy">
            Investment Strategy
          </Link>
        </li>

        <li className="nav-item">
          <Link className={isActive("/market")} to="/market">
            Market Insights
          </Link>
        </li>

        <li className="nav-item">
          <Link className={isActive("/calculator")} to="/calculator">
            ROI Calculator
          </Link>
        </li>
      </ul>

      <div className="d-flex align-items-center gap-2">
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <Link className="btn btn-outline-light btn-sm" to="/profile">
          Profile
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
