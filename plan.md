好，从零开始的完整执行方案：

---

## 第一步：创建项目

```powershell
cd D:\\Dev-test\\test1\\test-gl-1000
npm create vite@latest sharp-3d-viewer -- --template react
cd sharp-3d-viewer
npm install three @mkkellogg/gaussian-splats-3d
```

## 第二步：复制 .ply 文件到 public

```powershell
mkdir -Force D:\\Dev-test\\test1\\test-gl-1000\\sharp-3d-viewer\\public
Copy-Item "D:\\DevProjects\\my\\github\\3D-web\\image.ply" "D:\\Dev-test\\test1\\test-gl-1000\\sharp-3d-viewer\\public\\image.ply"
```

## 第三步：创建目录结构

```powershell
mkdir -Force src\\components
mkdir -Force src\\hooks
mkdir -Force src\\utils
```

## 第四步：写入所有文件

逐个创建以下文件：

---

### `src/App.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #000;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

canvas {
  display: block;
}

.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  z-index: 100;
  transition: opacity 0.6s ease;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loading-title {
  color: #fff;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 2px;
}

.progress-track {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 1px;
  transition: width 0.1s ease-out;
}

.hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  letter-spacing: 2px;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.6s ease;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
```

---

### `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

### `src/App.jsx`

```jsx
import React from 'react'
import { GaussianViewer } from './components/GaussianViewer'

export default function App() {
  return <GaussianViewer plyPath="/image.ply" />
}
```

---

### `src/utils/cameraPath.js`

```jsx
import * as THREE from 'three'

// ========== 直线路径 ==========
export function createLinearPath() {
  const start = new THREE.Vector3(0, 0, -3)
  const end = new THREE.Vector3(0, 0, 8)

  return {
    getPosition(t) {
      return new THREE.Vector3().lerpVectors(start, end, t)
    },
    getLookAt(t) {
      const pos = this.getPosition(t)
      return pos.clone().add(new THREE.Vector3(0, 0, 5))
    },
  }
}

// ========== 曲线路径（电影感） ==========
export function createCurvePath() {
  const positionCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -4),
    new THREE.Vector3(1.5, -0.3, -1),
    new THREE.Vector3(-1, 0.2, 2),
    new THREE.Vector3(0.5, -0.5, 5),
    new THREE.Vector3(0, 0, 8),
  ])

  return {
    getPosition(t) {
      return positionCurve.getPoint(t)
    },
    getLookAt(t) {
      const lookT = Math.min(t + 0.05, 1)
      return positionCurve.getPoint(lookT)
    },
  }
}

// 默认使用直线路径（先跑通，再切 createCurvePath()）
export const defaultPath = createLinearPath()
```

---

### `src/hooks/useScrollProgress.js`

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'

export function useScrollProgress({
  sensitivity = 0.0008,
  touchSensitivity = 0.002,
  smoothFactor = 0.06,
} = {}) {
  const targetRef = useRef(0)
  const smoothRef = useRef(0)
  const [smoothProgress, setSmoothProgress] = useState(0)
  const rafRef = useRef(null)

  // 滚轮事件
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()
      targetRef.current += e.deltaY * sensitivity
      targetRef.current = Math.max(0, Math.min(1, targetRef.current))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [sensitivity])

  // 触摸事件
  useEffect(() => {
    let touchStartY = 0
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      e.preventDefault()
      const deltaY = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      targetRef.current += deltaY * touchSensitivity
      targetRef.current = Math.max(0, Math.min(1, targetRef.current))
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [touchSensitivity])

  // 平滑动画循环
  useEffect(() => {
    const tick = () => {
      smoothRef.current += (targetRef.current - smoothRef.current) * smoothFactor
      setSmoothProgress(smoothRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [smoothFactor])

  const reset = useCallback(() => {
    targetRef.current = 0
    smoothRef.current = 0
    setSmoothProgress(0)
  }, [])

  return { progress: smoothProgress, reset }
}
```

---

### `src/hooks/useGaussianScene.js`

```jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d'

export function useGaussianScene(containerRef, plyPath) {
  const viewerRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = window.innerWidth
    const height = window.innerHeight

    // 相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    cameraRef.current = camera

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Gaussian Splatting Viewer
    const viewer = new GaussianSplats3D.Viewer({
      selfDrivenMode: false,
      renderer,
      camera,
      useBuiltInControls: false,
      sharedMemoryForWorkers: false,
    })

    viewer
      .addSplatScene(plyPath, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        position: [0, 0, 0],
        rotation: [Math.PI, 0, 0, 1], // OpenCV → Three.js 坐标修正
      })
      .then(() => {
        viewerRef.current = viewer
        setIsLoaded(true)
      })

    // 窗口缩放
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [containerRef, plyPath])

  const render = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.update()
      viewerRef.current.render()
    }
  }, [])

  return {
    camera: cameraRef,
    renderer: rendererRef,
    isLoaded,
    render,
  }
}
```

---

### `src/components/LoadingScreen.jsx`

```jsx
import React from 'react'

export function LoadingScreen({ visible }) {
  return (
    <div className={`loading-screen ${!visible ? 'fade-out' : ''}`}>
      <div className="loading-title">S H A R P</div>
      <div className="loading-spinner" />
    </div>
  )
}
```

---

### `src/components/ProgressBar.jsx`

```jsx
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
```

---

### `src/components/GaussianViewer.jsx`

```jsx
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
    sensitivity: 0.0008,
    smoothFactor: 0.06,
  })

  // 滚动后隐藏提示
  useEffect(() => {
    if (progress > 0.02) {
      setShowHint(false)
    }
  }, [progress])

  // 动画循环
  useEffect(() => {
    if (!isLoaded || !camera.current) return

    let rafId
    const animate = () => {
      const position = defaultPath.getPosition(progress)
      const lookAt = defaultPath.getLookAt(progress)

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
      {isLoaded && <ProgressBar progress={progress} />}
      {isLoaded && showHint && (
        <div className="hint">↓ SCROLL TO START ↓</div>
      )}
    </>
  )
}
```

---

## 第五步：运行

```powershell
cd D:\\Dev-test\\test1\\test-gl-1000\\sharp-3d-viewer
npm run dev
```

浏览器打开 `http://localhost:5173`，滚动鼠标穿越 3D 场景 🚀

---

## 文件清单确认

```
sharp-3d-viewer/
├── public/
│   └── image.ply               ← 你的 3D 高斯点云
├── src/
│   ├── components/
│   │   ├── GaussianViewer.jsx  ← 主场景组件
│   │   ├── LoadingScreen.jsx   ← 加载动画
│   │   └── ProgressBar.jsx     ← 底部进度条
│   ├── hooks/
│   │   ├── useScrollProgress.js ← 滚轮/触摸进度
│   │   └── useGaussianScene.js  ← 3DGS 场景管理
│   ├── utils/
│   │   └── cameraPath.js       ← 相机路径配置
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── index.html
```

共  **10 个文件** ，复制粘贴即可。跑起来后根据效果调 `cameraPath.js` 里的坐标参数 👍
