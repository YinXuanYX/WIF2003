import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark shadow-sm px-3">

      {/* Brand */}
      <Link className="navbar-brand fw-bold" to="/goals">
        💰 Financial Planner
      </Link>

      {/* Nav items */}
      <ul className="navbar-nav me-auto d-flex flex-row gap-3">

        <li className="nav-item">
          <Link className="nav-link" to="/goals">
            Financial Goals
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/strategy">
            Investment Strategy
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/market">
            Market Insights
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/calculator">
            ROI Calculator
          </Link>
        </li>

      </ul>

      {/* Right side */}
      <div className="d-flex">

        <Link className="btn btn-outline-light me-2" to="/profile">
          Profile
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;