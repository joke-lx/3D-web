import React from 'react'

export function ProgressBar({ progress }) {
  const percent = Math.round(progress * 100)

  return (
    <div className="progress-bar">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-text">SCROLL TO EXPLORE · {percent}%</div>
    </div>
  )
}
