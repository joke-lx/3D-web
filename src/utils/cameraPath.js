import * as THREE from 'three'

// ========== 曲线路径（电影感） ==========
export function createCurvePath() {
  // 只保留起点到原32%位置之间的路径
  const positionCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -4),          // 起点
    new THREE.Vector3(0.56, -0.12, -2.5), // 中间过渡点
    new THREE.Vector3(1.20, -0.24, -1.3), // 中间过渡点
    new THREE.Vector3(0.99, -0.19, -0.15),// 终点（原32%位置）
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
