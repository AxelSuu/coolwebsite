import * as THREE from 'three'

export class Mouse {
  position = new THREE.Vector2(0, 0)
  smooth = new THREE.Vector2(0, 0)

  private ease = 0.05

  constructor() {
    window.addEventListener('mousemove', (e) => {
      this.position.x = (e.clientX / window.innerWidth) * 2 - 1
      this.position.y = -(e.clientY / window.innerHeight) * 2 + 1
    })

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.position.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
        this.position.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }, { passive: true })
  }

  update() {
    this.smooth.x += (this.position.x - this.smooth.x) * this.ease
    this.smooth.y += (this.position.y - this.smooth.y) * this.ease
  }
}
