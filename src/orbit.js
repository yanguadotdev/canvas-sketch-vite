// orbit.js
import canvasSketch from 'canvas-sketch'
import math from 'canvas-sketch-util/math'

const settings = {
  dimensions: [1080, 1080],
  animate: true,
}

const sketch = () => {
  const points = []

  const radius = 300
  const latSteps = 60
  const lonSteps = 60

  for (let i = 0; i < latSteps; i++) {
    const theta = math.mapRange(i, 0, latSteps - 1, 0, Math.PI)

    for (let j = 0; j < lonSteps; j++) {
      const phi = math.mapRange(j, 0, lonSteps - 1, 0, Math.PI * 2)

      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.cos(theta)
      const z = radius * Math.sin(theta) * Math.sin(phi)

      points.push({ x, y, z })
    }
  }

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    context.save()
    context.translate(width / 2, height / 2)

    context.fillStyle = 'white'

    const angle = frame * 0.005
    const fov = 1000 // distance of camera

    for (const p of points) {
      // Rotation on Y axis
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const x = p.x * cos - p.z * sin
      const z = p.x * sin + p.z * cos
      const y = p.y

      // Perspective projection
      const scale = fov / (fov + z)
      const px = x * scale
      const py = y * scale

      // Point size also depends on scale
      const pointSize = scale * 1.5

      context.beginPath()
      context.arc(px, py, pointSize, 0, Math.PI * 2)
      context.fill()
    }

    context.restore()
  }
}

canvasSketch(sketch, settings)
