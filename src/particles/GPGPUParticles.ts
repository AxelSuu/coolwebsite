import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import positionShader from './gpgpu-position.glsl'
import particleVertexShader from './particles-vertex.glsl'
import particleFragmentShader from './particles-fragment.glsl'

export class GPGPUParticles {
  private gpuCompute: GPUComputationRenderer
  private positionVariable: any
  private particleMesh: THREE.Points
  private size: number

  /** Uniforms accessible from outside */
  uniforms: {
    uMorphProgress: { value: number }
    uExplosionForce: { value: number }
    uMouse: { value: THREE.Vector2 }
  }

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, size = 256) {
    this.size = size
    const count = size * size

    // Initialize GPGPU
    this.gpuCompute = new GPUComputationRenderer(size, size, renderer)

    // Create initial position texture (random sphere distribution)
    const posTexture = this.gpuCompute.createTexture()
    const velTexture = this.gpuCompute.createTexture()
    this.fillRandomSphere(posTexture, 80)
    this.fillZero(velTexture)

    // Add position variable
    this.positionVariable = this.gpuCompute.addVariable(
      'uCurrentPositions',
      positionShader,
      posTexture
    )

    // Set dependencies (position reads itself)
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable])

    // Add uniforms to position shader
    const posUniforms = this.positionVariable.material.uniforms
    posUniforms.uCurrentVelocities = { value: velTexture }
    posUniforms.uTargetPositions = { value: posTexture } // Will be replaced
    posUniforms.uTime = { value: 0 }
    posUniforms.uDelta = { value: 0.016 }
    posUniforms.uMorphProgress = { value: 0 }
    posUniforms.uExplosionForce = { value: 0 }
    posUniforms.uMouse = { value: new THREE.Vector2(0, 0) }

    this.uniforms = {
      uMorphProgress: posUniforms.uMorphProgress,
      uExplosionForce: posUniforms.uExplosionForce,
      uMouse: posUniforms.uMouse,
    }

    // Initialize
    const error = this.gpuCompute.init()
    if (error !== null) {
      console.error('GPGPU init error:', error)
    }

    // Create particle mesh for rendering
    this.particleMesh = this.createParticleMesh(count)
    scene.add(this.particleMesh)
  }

  private createParticleMesh(count: number): THREE.Points {
    const geometry = new THREE.BufferGeometry()

    // Position attribute (dummy, actual positions come from GPGPU texture)
    const positions = new Float32Array(count * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Reference UVs to look up position in GPGPU texture
    const references = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      const x = (i % this.size) / this.size
      const y = Math.floor(i / this.size) / this.size
      references[i * 2] = x
      references[i * 2 + 1] = y
    }
    geometry.setAttribute('aReference', new THREE.BufferAttribute(references, 2))

    // Random attribute for variation
    const randoms = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random()
    }
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uPositions: { value: null },
        uPixelRatio: { value: 1 },
        uSize: { value: 25.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return new THREE.Points(geometry, material)
  }

  setTargetPositions(texture: THREE.DataTexture) {
    this.positionVariable.material.uniforms.uTargetPositions.value = texture
  }

  fillRandomSphere(texture: THREE.DataTexture, radius: number) {
    const data = texture.image.data as unknown as Float32Array
    for (let i = 0; i < data.length; i += 4) {
      // Random point in sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random())

      data[i] = r * Math.sin(phi) * Math.cos(theta)
      data[i + 1] = r * Math.sin(phi) * Math.sin(theta)
      data[i + 2] = r * Math.cos(phi)
      data[i + 3] = 1.0 // life
    }
  }

  private fillZero(texture: THREE.DataTexture) {
    const data = texture.image.data as unknown as Float32Array
    for (let i = 0; i < data.length; i++) {
      data[i] = 0
    }
  }

  createTargetFromPositions(positions: Float32Array): THREE.DataTexture {
    const count = this.size * this.size
    const data = new Float32Array(count * 4)

    for (let i = 0; i < count; i++) {
      const posIndex = (i % (positions.length / 3)) * 3
      data[i * 4] = positions[posIndex]
      data[i * 4 + 1] = positions[posIndex + 1]
      data[i * 4 + 2] = positions[posIndex + 2]
      data[i * 4 + 3] = 1.0
    }

    const texture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    texture.needsUpdate = true
    return texture
  }

  createStarfieldTarget(radius: number, zOffset: number): THREE.DataTexture {
    const count = this.size * this.size
    const data = new Float32Array(count * 4)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.3 + Math.random() * 0.7)

      data[i * 4] = r * Math.sin(phi) * Math.cos(theta)
      data[i * 4 + 1] = r * Math.sin(phi) * Math.sin(theta)
      data[i * 4 + 2] = r * Math.cos(phi) + zOffset
      data[i * 4 + 3] = 1.0
    }

    const texture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    texture.needsUpdate = true
    return texture
  }

  update(delta: number, elapsed: number) {
    const posUniforms = this.positionVariable.material.uniforms
    posUniforms.uTime.value = elapsed
    posUniforms.uDelta.value = Math.min(delta, 0.05) // Cap delta

    this.gpuCompute.compute()

    // Pass computed positions to render material
    const material = this.particleMesh.material as THREE.ShaderMaterial
    material.uniforms.uPositions.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
  }

  dispose() {
    this.particleMesh.geometry.dispose()
    ;(this.particleMesh.material as THREE.ShaderMaterial).dispose()
    this.gpuCompute.dispose()
  }
}
