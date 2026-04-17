import * as THREE from 'three'
import { Section } from './Section'

export class PlanetSection extends Section {
  readonly startProgress = 0.42
  readonly endProgress = 0.68

  private group: THREE.Group
  private planet: THREE.Mesh
  private moons: THREE.Mesh[] = []

  constructor(scene: THREE.Scene, isMobile = false) {
    super(scene)

    this.group = new THREE.Group()
    this.group.position.set(0, 0, -540)
    this.group.visible = false

    const segments = isMobile ? 16 : 32

    // Planet — gradient-like look with MeshBasicMaterial
    const planetGeo = new THREE.SphereGeometry(40, segments, segments / 2)

    // Color the vertices to create banding
    const colors = new Float32Array(planetGeo.attributes.position.count * 3)
    const posArr = planetGeo.attributes.position.array
    for (let i = 0; i < planetGeo.attributes.position.count; i++) {
      const y = posArr[i * 3 + 1] / 40 // normalized y
      const band = Math.sin(y * 20) * 0.5 + 0.5
      colors[i * 3] = 0.4 + band * 0.4      // R
      colors[i * 3 + 1] = 0.25 + band * 0.25 // G
      colors[i * 3 + 2] = 0.15 + band * 0.15 // B
    }
    planetGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    this.planet = new THREE.Mesh(planetGeo, new THREE.MeshBasicMaterial({ vertexColors: true }))
    this.group.add(this.planet)

    // Atmosphere glow — simple additive sphere (desktop only)
    if (!isMobile) {
      const atmosGeo = new THREE.SphereGeometry(42, 20, 10)
      const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      this.group.add(new THREE.Mesh(atmosGeo, atmosMat))

      // Ring
      const ringGeo = new THREE.RingGeometry(56, 90, 32, 1)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xaa9977,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI * 0.4
      this.group.add(ring)
    }

    // 1 moon
    const moonGeo = new THREE.IcosahedronGeometry(3, 0)
    const moon = new THREE.Mesh(moonGeo, new THREE.MeshBasicMaterial({ color: 0x888899 }))
    this.moons.push(moon)
    this.group.add(moon)

    scene.add(this.group)
  }

  activate() { super.activate(); this.group.visible = true }
  deactivate() { super.deactivate(); this.group.visible = false }

  update(_globalProgress: number, _delta: number, elapsed: number) {
    this.planet.rotation.y = elapsed * 0.03
    const a = elapsed * 0.3
    this.moons[0].position.set(Math.cos(a) * 65, Math.sin(a) * 5, Math.sin(a) * 65)
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else mat.dispose()
      }
    })
    this.scene.remove(this.group)
  }
}
