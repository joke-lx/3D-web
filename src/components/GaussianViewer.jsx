import React, { useRef, useEffect, useState } from 'react'
import { useGaussianScene } from '../hooks/useGaussianScene'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { defaultPath } from '../utils/cameraPath'
import { LoadingScreen } from './LoadingScreen'
import { ProgressBar } from './ProgressBar'

export function GaussianViewer({ plyPath = '/image.ply' }) {
  const containerRef = useRef(null)
  const [showHint, setShowHint] = useState(true)

  const { camera, isLoaded, render } = useGaussianScene(containerRef, plyPath)
  const { progress } = useScrollProgress({
    sensitivity: 0.0012,
    smoothFactor: 0.06,
  })

  // 滚动后隐藏提示
  useEffect(() => {
    if (progress > 0.02) {
      setShowHint(false)
    }
  }, [progress])

  // 路径终点已设为原32%位置，无需封顶
  const effectiveProgress = progress

  // 动画循环
  useEffect(() => {
    if (!isLoaded || !camera.current) return

    let rafId
    const animate = () => {
      const position = defaultPath.getPosition(effectiveProgress)
      const lookAt = defaultPath.getLookAt(effectiveProgress)

      camera.current.position.copy(position)
      camera.current.lookAt(lookAt)

      render()
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [isLoaded, progress, camera, render])

  return (
    <>
      <LoadingScreen visible={!isLoaded} />
      <div ref={containerRef} />
      {isLoaded && <ProgressBar progress={effectiveProgress} />}
      {isLoaded && showHint && (
        <div className="hint">↓ SCROLL TO START ↓</div>
      )}
    </>
  )
}
