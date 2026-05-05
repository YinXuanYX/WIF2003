import React from 'react'

function GlassCard({ children, className = '', bodyClassName = 'd-flex flex-column h-100', style = {}, animationOrder, ...props }) {
  const inlineStyle = {
    ...style,
    ...(animationOrder !== undefined ? { '--animation-order': animationOrder } : {})
  }

  return (
    <div 
      className={`glass-card ${animationOrder !== undefined ? 'animate-fade-in-up' : ''} ${className}`} 
      style={inlineStyle}
      {...props}
    >
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  )
}

export default GlassCard
