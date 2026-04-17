import * as THREE from 'three'

export class CameraPath {
  private positionCurve: THREE.CatmullRomCurve3
  private lookAtCurve: THREE.CatmullRomCurve3

  constructor() {
    // Camera position waypoints through the journey
    this.positionCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 50),        // Opening: facing text
      new THREE.Vector3(0, 2, 20),         // Text formed
      new THREE.Vector3(0, 5, -50),        // Post-explosion, entering nebula
      new THREE.Vector3(-20, 10, -200),    // Deep in nebula
      new THREE.Vector3(10, -5, -350),     // Exiting nebula
      new THREE.Vector3(80, 20, -500),     // Approaching planet from side
      new THREE.Vector3(40, 30, -560),     // Orbiting planet
      new THREE.Vector3(-30, 10, -620),    // Past planet
      new THREE.Vector3(0, 0, -750),       // Approaching black hole
      new THREE.Vector3(0, 5, -850),       // Close to black hole
      new THREE.Vector3(0, 0, -950),       // Past black hole
      new THREE.Vector3(0, 0, -1100),      // Ending
    ], false, 'catmullrom', 0.3)

    // Look-at target waypoints
    this.lookAtCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),          // Looking at text
      new THREE.Vector3(0, 0, -10),        // Still at text
      new THREE.Vector3(0, 0, -150),       // Into nebula
      new THREE.Vector3(0, 0, -300),       // Through nebula
      new THREE.Vector3(0, 0, -450),       // Toward planet
      new THREE.Vector3(0, 0, -540),       // At planet
      new THREE.Vector3(0, 0, -580),       // Around planet
      new THREE.Vector3(0, 0, -700),       // Toward black hole
      new THREE.Vector3(0, 0, -800),       // At black hole
      new THREE.Vector3(0, 0, -900),       // Past black hole
      new THREE.Vector3(0, 0, -1000),      // Toward ending
      new THREE.Vector3(0, 0, -1150),      // At ending
    ], false, 'catmullrom', 0.3)
  }

  getPosition(progress: number): THREE.Vector3 {
    return this.positionCurve.getPointAt(Math.min(Math.max(progress, 0), 1))
  }

  getLookAt(progress: number): THREE.Vector3 {
    return this.lookAtCurve.getPointAt(Math.min(Math.max(progress, 0), 1))
  }
}
