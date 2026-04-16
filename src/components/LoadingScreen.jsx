import React from 'react'

export function LoadingScreen({ visible }) {
  return (
    <div className={`loading-screen ${!visible ? 'fade-out' : ''}`}>
      <div className="loading-title">S H A R P</div>
      <div className="loading-spinner" />
    </div>
  )
}
