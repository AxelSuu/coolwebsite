import * as THREE from 'three'
import { Section } from './Section'
import { SimpleParticles } from '../particles/SimpleParticles'
import { generateTextPositions } from '../utils/TextGeometryHelper'

export class OpeningSection extends Section {
  readonly startProgress = 0.0
  readonly endProgress = 0.20

  particles: SimpleParticles

  constructor(scene: THREE.Scene, particleCount = 4000) {
    super(scene)

    this.particles = new SimpleParticles(scene, particleCount)

    const textPositions = generateTextPositions('Scroll, by Axel', particleCount, 1.0, 0)
    this.particles.setTextTargets(textPositions)
  }

  update(globalProgress: number, delta: number, _elapsed: number) {
    const local = this.getLocalProgress(globalProgress)

    if (local < 0.7) {
      const morphProgress = Math.min(local / 0.5, 1.0)
      this.particles.morphProgress = 1 - Math.pow(1 - morphProgress, 3)
      this.particles.explosionForce = 0
      this.particles.currentTarget = 'text'
    } else {
      const explosionLocal = (local - 0.7) / 0.3
      this.particles.currentTarget = 'starfield'
      this.particles.morphProgress = Math.min(explosionLocal * 0.5, 0.3)
      this.particles.explosionForce = Math.max(0, (1 - explosionLocal)) * 8.0
    }
  }

  dispose() {
    this.particles.dispose()
  }
}
