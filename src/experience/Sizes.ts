export class Sizes {
  width: number
  height: number
  pixelRatio: number
  isMobile: boolean

  private resizeCallbacks: (() => void)[] = []

  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.isMobile = this.detectMobile()
    this.pixelRatio = this.isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)

    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.resizeCallbacks.forEach(cb => cb())
    })
  }

  private detectMobile(): boolean {
    return window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024)
  }

  get aspect() {
    return this.width / this.height
  }

  onResize(cb: () => void) {
    this.resizeCallbacks.push(cb)
  }
}
