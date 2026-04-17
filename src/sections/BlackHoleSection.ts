import * as THREE from 'three'
import { Section } from './Section'

export class BlackHoleSection extends Section {
  readonly startProgress = 0.62
  readonly endProgress = 0.88

  private group: THREE.Group
  private accretionDisk: THREE.Mesh
  private photonSphere: THREE.Mesh

  constructor(scene: THREE.Scene, isMobile = false) {
    super(scene)

    this.group = new THREE.Group()
    this.group.position.set(0, 0, -820)
    this.group.visible = false

    // Event horizon
    const ehGeo = new THREE.SphereGeometry(12, isMobile ? 8 : 16, isMobile ? 6 : 10)
    this.group.add(new THREE.Mesh(ehGeo, new THREE.MeshBasicMaterial({ color: 0x000000 })))

    // Photon sphere
    const psGeo = new THREE.TorusGeometry(18, 0.4, 6, isMobile ? 20 : 32)
    this.photonSphere = new THREE.Mesh(psGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85,
    }))
    this.photonSphere.rotation.x = Math.PI * 0.45
    this.group.add(this.photonSphere)

    // Accretion disk — simple ring with basic material (no custom shader)
    const diskGeo = new THREE.RingGeometry(18, isMobile ? 45 : 60, isMobile ? 20 : 32, 2)
    const diskMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.4, 0.1),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.accretionDisk = new THREE.Mesh(diskGeo, diskMat)
    this.accretionDisk.rotation.x = -Math.PI * 0.42
    this.group.add(this.accretionDisk)

    // Inner hotter ring
    const innerDiskGeo = new THREE.RingGeometry(14, 22, isMobile ? 16 : 24, 1)
    const innerDiskMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.8, 0.5),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const innerDisk = new THREE.Mesh(innerDiskGeo, innerDiskMat)
    innerDisk.rotation.x = -Math.PI * 0.42
    this.group.add(innerDisk)

    // Jets only on desktop
    if (!isMobile) {
      const jetGeo = new THREE.ConeGeometry(2.5, 60, 5, 1, true)
      const jetMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.3, 0.5, 1.0),
        transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.DoubleSide,
      })
      const topJet = new THREE.Mesh(jetGeo, jetMat)
      topJet.position.y = 30
      this.group.add(topJet)
      const bottomJet = new THREE.Mesh(jetGeo.clone(), jetMat.clone())
      bottomJet.position.y = -30
      bottomJet.rotation.z = Math.PI
      this.group.add(bottomJet)
    }

    scene.add(this.group)
  }

  activate() { super.activate(); this.group.visible = true }
  deactivate() { super.deactivate(); this.group.visible = false }

  update(_globalProgress: number, _delta: number, elapsed: number) {
    this.accretionDisk.rotation.z = elapsed * 0.2
    const psMat = this.photonSphere.material as THREE.MeshBasicMaterial
    psMat.opacity = 0.6 + Math.sin(elapsed * 3) * 0.25
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else mat.dispose()
      }
    })
    this.scene.remove(this.group)
  }
}
