import * as THREE from 'three'
import { Sizes } from './Sizes'
import { Mouse } from './Mouse'

export class Camera {
  instance: THREE.PerspectiveCamera
  private mouse: Mouse

  basePosition = new THREE.Vector3(0, 0, 0)
  baseLookAt = new THREE.Vector3(0, 0, -1)

  private parallaxStrength: number
  private lookTarget = new THREE.Vector3() // reuse instead of cloning

  constructor(sizes: Sizes, mouse: Mouse) {
    this.mouse = mouse
    this.parallaxStrength = sizes.isMobile ? 0.15 : 0.4

    this.instance = new THREE.PerspectiveCamera(65, sizes.aspect, 1, 1500)
    this.instance.position.set(0, 0, 0)

    sizes.onResize(() => {
      this.instance.aspect = sizes.aspect
      this.instance.updateProjectionMatrix()
    })
  }

  update() {
    this.instance.position.x = this.basePosition.x + this.mouse.smooth.x * this.parallaxStrength
    this.instance.position.y = this.basePosition.y + this.mouse.smooth.y * this.parallaxStrength * 0.5
    this.instance.position.z = this.basePosition.z

    this.lookTarget.copy(this.baseLookAt)
    this.lookTarget.x += this.mouse.smooth.x * 0.2
    this.lookTarget.y += this.mouse.smooth.y * 0.15
    this.instance.lookAt(this.lookTarget)
  }
}
