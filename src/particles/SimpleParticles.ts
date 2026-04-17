import * as THREE from 'three'

/**
 * Simple CPU-based particle system. No GPGPU, no float textures,
 * no render-to-texture. Just BufferGeometry + PointsMaterial.
 */
export class SimpleParticles {
  mesh: THREE.Points
  private count: number
  private positions: Float32Array
  private targets: Float32Array
  private starfield: Float32Array
  private velocities: Float32Array

  morphProgress = 0
  explosionForce = 0
  currentTarget: 'text' | 'starfield' | 'ending' = 'text'

  private endingTargets: Float32Array | null = null

  constructor(scene: THREE.Scene, count = 4000) {
    this.count = count
    this.positions = new Float32Array(count * 3)
    this.targets = new Float32Array(count * 3)
    this.starfield = new Float32Array(count * 3)
    this.velocities = new Float32Array(count * 3)

    // Init random sphere
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 30 + Math.random() * 40

      this.positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      this.positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      this.positions[i * 3 + 2] = r * Math.cos(phi)
    }

    // Generate starfield positions
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 100 + Math.random() * 250

      this.starfield[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      this.starfield[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      this.starfield[i * 3 + 2] = r * Math.cos(phi) - 500
    }

    // Colors
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = Math.random()
      if (t < 0.33) {
        colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0
      } else if (t < 0.66) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.6
      } else {
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    this.mesh = new THREE.Points(geo, mat)
    scene.add(this.mesh)
  }

  setTextTargets(positions: Float32Array) {
    // Copy into targets, cycling if needed
    for (let i = 0; i < this.count; i++) {
      const srcIdx = (i % (positions.length / 3)) * 3
      this.targets[i * 3] = positions[srcIdx]
      this.targets[i * 3 + 1] = positions[srcIdx + 1]
      this.targets[i * 3 + 2] = positions[srcIdx + 2]
    }
  }

  setEndingTargets(positions: Float32Array) {
    this.endingTargets = new Float32Array(this.count * 3)
    for (let i = 0; i < this.count; i++) {
      const srcIdx = (i % (positions.length / 3)) * 3
      this.endingTargets[i * 3] = positions[srcIdx]
      this.endingTargets[i * 3 + 1] = positions[srcIdx + 1]
      this.endingTargets[i * 3 + 2] = positions[srcIdx + 2]
    }
  }

  update(delta: number) {
    const dt = Math.min(delta, 0.05)
    const target = this.currentTarget === 'text' ? this.targets :
                   this.currentTarget === 'ending' && this.endingTargets ? this.endingTargets :
                   this.starfield

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3

      // Direction to target
      const dx = target[i3] - this.positions[i3]
      const dy = target[i3 + 1] - this.positions[i3 + 1]
      const dz = target[i3 + 2] - this.positions[i3 + 2]

      // Morph: lerp toward target
      const morphSpeed = this.morphProgress * 2.0
      this.velocities[i3] += dx * morphSpeed * dt
      this.velocities[i3 + 1] += dy * morphSpeed * dt
      this.velocities[i3 + 2] += dz * morphSpeed * dt

      // Explosion: push outward
      if (this.explosionForce > 0.01) {
        const px = this.positions[i3]
        const py = this.positions[i3 + 1]
        const pz = this.positions[i3 + 2]
        const len = Math.sqrt(px * px + py * py + pz * pz) + 0.001
        this.velocities[i3] += (px / len) * this.explosionForce * dt * 10
        this.velocities[i3 + 1] += (py / len) * this.explosionForce * dt * 10
        this.velocities[i3 + 2] += (pz / len) * this.explosionForce * dt * 10
      }

      // Damping
      this.velocities[i3] *= 0.94
      this.velocities[i3 + 1] *= 0.94
      this.velocities[i3 + 2] *= 0.94

      // Integrate
      this.positions[i3] += this.velocities[i3]
      this.positions[i3 + 1] += this.velocities[i3 + 1]
      this.positions[i3 + 2] += this.velocities[i3 + 2]
    }

    this.mesh.geometry.attributes.position.needsUpdate = true
  }

  dispose() {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.PointsMaterial).dispose()
  }
}
