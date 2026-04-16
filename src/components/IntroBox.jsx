import React from 'react'

export function IntroBox({ visible }) {
  return (
    <div className={`intro-box ${visible ? 'visible' : ''}`}>
      <div className="intro-title">Muse Dash</div>
      <div className="intro-desc">
        当战斗与演奏间的屏障被打破
        <br />
        你可否听到来自另一个世界的呼唤？
        <br /><br />
        Game Starts Now!!
      </div>
      <div className="intro-tag">★★★</div>
    </div>
  )
}
