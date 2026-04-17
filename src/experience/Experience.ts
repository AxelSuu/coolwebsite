import * as THREE from 'three'
import { Sizes } from './Sizes'
import { Mouse } from './Mouse'
import { Camera } from './Camera'
import { Renderer } from './Renderer'
import { ScrollManager } from './ScrollManager'
import { CameraPath } from '../utils/CameraPath'
import { Section } from '../sections/Section'
import { OpeningSection } from '../sections/OpeningSection'
import { NebulaSection } from '../sections/NebulaSection'
import { PlanetSection } from '../sections/PlanetSection'
import { BlackHoleSection } from '../sections/BlackHoleSection'
import { EndingSection } from '../sections/EndingSection'

export class Experience {
  canvas: HTMLCanvasElement
  scene: THREE.Scene
  sizes: Sizes
  mouse: Mouse
  camera: Camera
  renderer: Renderer
  scroll: ScrollManager
  cameraPath: CameraPath
  sections: Section[]

  private clock = new THREE.Clock()
  private loadingScreen: HTMLElement
  private openingSection: OpeningSection

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.loadingScreen = document.getElementById('loading-screen')!

    this.scene = new THREE.Scene()
    this.sizes = new Sizes()
    this.mouse = new Mouse()
    this.camera = new Camera(this.sizes, this.mouse)
    this.renderer = new Renderer(canvas, this.sizes)
    this.scroll = new ScrollManager(this.sizes.isMobile)
    this.cameraPath = new CameraPath()

    // Particle count: 2000 on mobile, 4000 on desktop
    const particleCount = this.sizes.isMobile ? 2000 : 4000

    const openingSection = new OpeningSection(this.scene, particleCount)
    const endingSection = new EndingSection(this.scene, particleCount)
    endingSection.linkParticles(openingSection)

    this.openingSection = openingSection

    this.sections = [
      openingSection,
      new NebulaSection(this.scene, this.sizes.isMobile),
      new PlanetSection(this.scene, this.sizes.isMobile),
      new BlackHoleSection(this.scene, this.sizes.isMobile),
      endingSection,
    ]

    setTimeout(() => {
      this.loadingScreen.classList.add('hidden')
    }, 500)

    this.tick()
  }

  private tick = () => {
    requestAnimationFrame(this.tick)

    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()
    const progress = this.scroll.progress

    this.mouse.update()

    const camPos = this.cameraPath.getPosition(progress)
    const camLookAt = this.cameraPath.getLookAt(progress)
    this.camera.basePosition.copy(camPos)
    this.camera.baseLookAt.copy(camLookAt)
    this.camera.update()

    // Keep particles as starfield during middle sections
    const isOpening = progress <= 0.22
    const isEnding = progress >= 0.83
    if (!isOpening && !isEnding) {
      this.openingSection.particles.morphProgress *= 0.95
      this.openingSection.particles.explosionForce = 0
      this.openingSection.particles.currentTarget = 'starfield'
    }

    // Always update particles
    this.openingSection.particles.update(delta)

    // Update active sections
    for (const section of this.sections) {
      const inRange = section.isInRange(progress)
      if (inRange && !section['active']) section.activate()
      else if (!inRange && section['active']) section.deactivate()
      if (section['active']) section.update(progress, delta, elapsed)
    }

    // Direct render — no post-processing
    this.renderer.instance.render(this.scene, this.camera.instance)
  }
}
