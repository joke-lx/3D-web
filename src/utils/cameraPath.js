import * as THREE from 'three'

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

export const defaultPath = createCurvePath()
