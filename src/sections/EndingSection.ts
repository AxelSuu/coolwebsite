import * as THREE from 'three'
import { Section } from './Section'
import { OpeningSection } from './OpeningSection'
import { generateTextPositions } from '../utils/TextGeometryHelper'

export class EndingSection extends Section {
  readonly startProgress = 0.85
  readonly endProgress = 1.0

  private particleCount: number
  private openingSection: OpeningSection | null = null

  constructor(scene: THREE.Scene, particleCount = 4000) {
    super(scene)
    this.particleCount = particleCount
  }

  linkParticles(openingSection: OpeningSection) {
    this.openingSection = openingSection
    const textPositions = generateTextPositions('EXPLORE', this.particleCount, 1.2, -1050)
    this.openingSection.particles.setEndingTargets(textPositions)
  }

  update(globalProgress: number, _delta: number, _elapsed: number) {
    if (!this.openingSection) return
    const local = this.getLocalProgress(globalProgress)
    const p = this.openingSection.particles
    p.currentTarget = 'ending'
    p.morphProgress = Math.pow(local, 0.5) * 0.8
    p.explosionForce = 0
  }

  dispose() {}
}
