// ============================================================
// FormInput — Reusable glass-style input with leading icon
// Used across Profile, CashFlow, and other form pages.
// Follows the same visual language as AuthInput but works
// inside the app shell (not full-page auth layout).
// ============================================================

import { useState } from 'react';

export default function FormInput({
  id,
  label,
  type = 'text',
  icon,
  placeholder,
  error,
  autoComplete,
  showToggle = false,
  register,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="form-input-group">
      {label && (
        <label htmlFor={id} className="form-input-label">
          {label}
        </label>
      )}
      <div className="form-input-wrapper">
        {icon && <i className={`bi ${icon} form-input-icon`} />}
        <input
          id={id}
          type={resolvedType}
          className={`form-input-field ${icon ? 'form-input-field--has-icon' : ''} ${isPassword && showToggle ? 'form-input-field--has-toggle' : ''} ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...(register || {})}
          {...rest}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            className="form-input-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
        )}
      </div>
      {error && (
        <div className="form-input-error">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
