// orbit.js
import canvasSketch from 'canvas-sketch'
import math from 'canvas-sketch-util/math'
import { Pane } from 'tweakpane'

const settings = {
  dimensions: [1080, 1080],
  animate: true,
}

const params = {
  radius: 300,
  latSteps: 60,
  lonSteps: 60,
  rotationSpeed: 0.005,
  fov: 1000,
  pointSize: 1.5,
}

let points = []

const generatePoints = () => {
  points = []
  for (let i = 0; i < params.latSteps; i++) {
    const theta = math.mapRange(i, 0, params.latSteps - 1, 0, Math.PI)

    for (let j = 0; j < params.lonSteps; j++) {
      const phi = math.mapRange(j, 0, params.lonSteps - 1, 0, Math.PI * 2)

      const x = params.radius * Math.sin(theta) * Math.cos(phi)
      const y = params.radius * Math.cos(theta)
      const z = params.radius * Math.sin(theta) * Math.sin(phi)

      points.push({ x, y, z })
    }
  }
}

generatePoints()

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    context.save()
    context.translate(width / 2, height / 2)

    context.fillStyle = 'white'

    const angle = frame * params.rotationSpeed
    const fov = params.fov

    for (const p of points) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const x = p.x * cos - p.z * sin
      const z = p.x * sin + p.z * cos
      const y = p.y

      const scale = fov / (fov + z)
      const px = x * scale
      const py = y * scale

      const size = scale * params.pointSize

      context.beginPath()
      context.arc(px, py, size, 0, Math.PI * 2)
      context.fill()
    }

    context.restore()
  }
}

canvasSketch(sketch, settings)

const createPane = () => {
  const pane = new Pane({ title: 'Parameters' })

  pane
    .addBinding(params, 'radius', { min: 50, max: 500, step: 1 })
    .on('change', generatePoints)
  pane
    .addBinding(params, 'latSteps', { min: 10, max: 200, step: 1 })
    .on('change', generatePoints)
  pane
    .addBinding(params, 'lonSteps', { min: 10, max: 200, step: 1 })
    .on('change', generatePoints)
  pane.addBinding(params, 'rotationSpeed', {
    min: 0.001,
    max: 0.05,
    step: 0.001,
  })
  pane.addBinding(params, 'fov', { min: 400, max: 2000, step: 10 })
  pane.addBinding(params, 'pointSize', { min: 0.1, max: 5, step: 0.1 })
}

createPane()
