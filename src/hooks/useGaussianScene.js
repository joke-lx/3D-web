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
        rotation: [0, 0, 1, 0],
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
