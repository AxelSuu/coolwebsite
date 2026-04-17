import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export class ScrollManager {
  lenis: Lenis
  progress = 0

  constructor(isMobile = false) {
    const wrapper = document.getElementById('scroll-container')!
    const content = document.getElementById('scroll-content')!

    // Shorter scroll on mobile for better feel
    content.style.height = isMobile ? '4000px' : '6000px'

    this.lenis = new Lenis({
      wrapper,
      content,
      duration: isMobile ? 1.5 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: isMobile ? 2.0 : 1.0,
    })

    this.lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time: number) => {
      this.lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.create({
      trigger: content,
      scroller: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.progress = self.progress
      },
    })
  }
}
