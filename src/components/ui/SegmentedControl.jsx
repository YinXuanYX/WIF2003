import React from 'react'

function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`segmented-control ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`segmented-control__btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
