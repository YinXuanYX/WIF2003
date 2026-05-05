import React from 'react'

function SliderInput({ label, value, onChange, min, max, step, prefix, suffix, className = '' }) {
  return (
    <div className={`slider-input ${className}`}>
      <label className="form-label small fw-semibold mb-2">{label}</label>
      <div className="input-group">
        {prefix && <span className="input-group-text">{prefix}</span>}
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="input-group-text">{suffix}</span>}
      </div>
    </div>
  )
}

export default SliderInput
