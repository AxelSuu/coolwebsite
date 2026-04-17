/**
 * Generate particle positions from text using canvas-based approach.
 * No external font dependencies needed.
 */
export function generateTextPositions(
  text: string,
  count: number,
  scale = 1,
  zOffset = 0,
): Float32Array {
  // Render text to a canvas to get pixel positions
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontSize = 120
  canvas.width = 1024
  canvas.height = 256

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `bold ${fontSize}px "Helvetica Neue", Arial, sans-serif`
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  // Draw characters with manual spacing for broad browser support
  const spacing = 20
  const chars = text.split('')
  const totalWidth = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing)
  let x = (canvas.width - totalWidth) / 2
  for (const char of chars) {
    ctx.fillText(char, x, canvas.height / 2)
    x += ctx.measureText(char).width + spacing
  }

  // Sample white pixels
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  const sampledPositions: number[] = []
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const idx = (y * canvas.width + x) * 4
      if (pixels[idx] > 128) {
        // Map pixel position to 3D space
        const px = (x - canvas.width / 2) * scale * 0.08
        const py = (canvas.height / 2 - y) * scale * 0.08
        const pz = zOffset + (Math.random() - 0.5) * 0.5
        sampledPositions.push(px, py, pz)
      }
    }
  }

  // Fill output array, cycling through sampled positions
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const srcIdx = (i % (sampledPositions.length / 3)) * 3
    positions[i * 3] = sampledPositions[srcIdx] + (Math.random() - 0.5) * 0.3
    positions[i * 3 + 1] = sampledPositions[srcIdx + 1] + (Math.random() - 0.5) * 0.3
    positions[i * 3 + 2] = sampledPositions[srcIdx + 2]
  }

  return positions
}
