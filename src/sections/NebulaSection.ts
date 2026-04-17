import * as THREE from 'three'
import { Section } from './Section'

export class NebulaSection extends Section {
  readonly startProgress = 0.18
  readonly endProgress = 0.47

  private group: THREE.Group
  private cloudMeshes: THREE.Mesh[] = []

  constructor(scene: THREE.Scene, isMobile = false) {
    super(scene)

    this.group = new THREE.Group()
    this.group.position.z = -200
    this.group.visible = false

    const colors = [0x6611aa, 0x1166aa, 0xaa2266, 0x226688, 0x882266]
    const cloudCount = isMobile ? 4 : 6

    // Simple additive-blended sprites as clouds
    for (let i = 0; i < cloudCount; i++) {
      const size = 80 + Math.random() * 100
      const geo = new THREE.PlaneGeometry(size, size)
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.12 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geo, mat)
      const angle = Math.random() * Math.PI * 2
      const radius = 15 + Math.random() * 40
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -40 + Math.random() * -160,
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      this.cloudMeshes.push(mesh)
      this.group.add(mesh)
    }

    // Dust particles
    const dustCount = isMobile ? 300 : 600
    const positions = new Float32Array(dustCount * 3)
    const dustColors = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * 60
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.sin(a) * r + (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = -Math.random() * 180
      dustColors[i * 3] = 0.4 + Math.random() * 0.3
      dustColors[i * 3 + 1] = 0.1 + Math.random() * 0.3
      dustColors[i * 3 + 2] = 0.5 + Math.random() * 0.4
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3))
    this.group.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 1.0, sizeAttenuation: true, transparent: true, opacity: 0.4,
      vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })))

    // Central light
    const lightMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    lightMesh.position.set(25, 15, -120)
    this.group.add(lightMesh)

    scene.add(this.group)
  }

  activate() { super.activate(); this.group.visible = true }
  deactivate() { super.deactivate(); this.group.visible = false }

  update(globalProgress: number, _delta: number, _elapsed: number) {
    const local = this.getLocalProgress(globalProgress)
    const fadeIn = Math.min(local / 0.15, 1.0)
    const fadeOut = 1.0 - Math.max((local - 0.85) / 0.15, 0)
    const visibility = fadeIn * fadeOut

    for (const mesh of this.cloudMeshes) {
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        (0.12 + Math.random() * 0.02) * visibility
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
        child.geometry.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else mat.dispose()
      }
    })
    this.scene.remove(this.group)
  }
}
