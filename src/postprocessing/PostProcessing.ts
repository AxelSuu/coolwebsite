import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BloomEffect,
  VignetteEffect,
  KernelSize,
} from 'postprocessing'
import * as THREE from 'three'
import { Sizes } from '../experience/Sizes'

export class PostProcessing {
  composer: EffectComposer
  bloomEffect: BloomEffect
  vignetteEffect: VignetteEffect

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, sizes: Sizes) {
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
    })

    const renderPass = new RenderPass(scene, camera)
    this.composer.addPass(renderPass)

    // Bloom — smaller kernel for performance
    this.bloomEffect = new BloomEffect({
      intensity: 1.2,
      luminanceThreshold: 0.5,
      luminanceSmoothing: 0.3,
      mipmapBlur: true,
      kernelSize: KernelSize.MEDIUM,
    })

    // Vignette
    this.vignetteEffect = new VignetteEffect({
      darkness: 0.6,
      offset: 0.3,
    })

    // Single merged effect pass (bloom + vignette only)
    const effectPass = new EffectPass(
      camera,
      this.bloomEffect,
      this.vignetteEffect,
    )
    this.composer.addPass(effectPass)

    sizes.onResize(() => {
      this.composer.setSize(sizes.width, sizes.height)
    })
  }

  render(delta: number) {
    this.composer.render(delta)
  }
}
