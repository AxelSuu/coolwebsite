import * as THREE from 'three'

export abstract class Section {
  protected scene: THREE.Scene
  protected active = false

  /** Scroll progress range this section covers */
  abstract readonly startProgress: number
  abstract readonly endProgress: number

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /** Get local progress (0-1) within this section given global progress */
  getLocalProgress(globalProgress: number): number {
    const range = this.endProgress - this.startProgress
    return Math.max(0, Math.min(1, (globalProgress - this.startProgress) / range))
  }

  /** Check if global progress is within this section's range (with buffer) */
  isInRange(globalProgress: number): boolean {
    const buffer = 0.05
    return globalProgress >= this.startProgress - buffer && globalProgress <= this.endProgress + buffer
  }

  activate() {
    this.active = true
  }

  deactivate() {
    this.active = false
  }

  abstract update(globalProgress: number, delta: number, elapsed: number): void
  abstract dispose(): void
}
