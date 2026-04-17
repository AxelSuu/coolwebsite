import * as THREE from 'three'
import { Sizes } from './Sizes'

export class Renderer {
  instance: THREE.WebGLRenderer

  constructor(canvas: HTMLCanvasElement, sizes: Sizes) {
    this.instance = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })

    this.instance.setSize(sizes.width, sizes.height)
    this.instance.setPixelRatio(1) // Cap at 1 for performance
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.0

    sizes.onResize(() => {
      this.instance.setSize(sizes.width, sizes.height)
      this.instance.setPixelRatio(1)
    })
  }
}
