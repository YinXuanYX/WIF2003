// AuthLayout — Shared split-panel wrapper for Login & Register
// Left: Hero panel with mesh gradient + brand
// Right: Frosted glass form card
// Mobile: Hero collapses to compact header

import PigIcon from '../../assets/PigIcon.png'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      {/* Hero Panel — visible on desktop only (controlled by CSS) */}
      <div className="auth-hero">
        <div className="auth-hero__content">
          <div className="auth-hero__logo">
            <img src={PigIcon} alt="FinPlan logo" />
          </div>
          <h2 className="auth-hero__title">
            Take control of your
            <br />
            financial future
          </h2>
          <p className="auth-hero__subtitle">
            Track spending, set goals, and build your investment strategy — all in one place.
          </p>
          <div className="auth-hero__badges">
            <div className="auth-hero__badge">
              <i className="bi bi-shield-lock-fill" />
              <span>Bank-grade security</span>
            </div>
            <div className="auth-hero__badge">
              <i className="bi bi-graph-up-arrow" />
              <span>Smart insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Brand — mobile only (desktop has hero) */}
          <div className="auth-brand">
            <div className="auth-brand__icon">
              <img src={PigIcon} alt="FinPlan logo" />
            </div>
            <h1 className="auth-brand__title">{title}</h1>
            <p className="auth-brand__subtitle">{subtitle}</p>
          </div>

          {/* Glass Card */}
          <div className="auth-glass-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
