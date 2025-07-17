// orbit.js
import canvasSketch from 'canvas-sketch'
import math from 'canvas-sketch-util/math'

const settings = {
  dimensions: [1080, 1080],
  animate: false,
  fps: 60,
}

const sketch = () => {
  const points = []

  const radius = 300
  const latSteps = 60
  const lonSteps = 60

  // Generamos puntos en la esfera
  for (let i = 0; i < latSteps; i++) {
    const theta = math.mapRange(i, 0, latSteps - 1, 0, Math.PI) // latitud

    for (let j = 0; j < lonSteps; j++) {
      const phi = math.mapRange(j, 0, lonSteps - 1, 0, Math.PI * 2) // longitud

      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.cos(theta)
      const z = radius * Math.sin(theta) * Math.sin(phi)

      points.push({ x, y, z })
    }
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    context.save()
    context.translate(width / 2, height / 2)

    context.fillStyle = 'white'

    for (const p of points) {
      // Ignoramos z por ahora (proyección plana)
      const scale = 1 // sin escala por perspectiva aún
      const px = p.x * scale
      const py = p.y * scale

      context.beginPath()
      context.arc(px, py, 2, 0, Math.PI * 2)
      context.fill()
    }

    context.restore()
  }
}

canvasSketch(sketch, settings)
