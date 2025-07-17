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
  mouseRadius: 100,
  force: 75,
}

let points = []
let mouse = { x: 0, y: 0 }

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

    const angle = frame * params.rotationSpeed
    const fov = params.fov

    context.save()
    context.translate(width / 2, height / 2)

    context.fillStyle = 'white'

    for (const p of points) {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const x = p.x * cos - p.z * sin
      const z = p.x * sin + p.z * cos
      const y = p.y

      const scale = fov / (fov + z)
      let px = x * scale
      let py = y * scale
      const size = scale * params.pointSize

      // Aplicar repulsión si el mouse 
      const dx = px - (mouse.x - width / 2)
      const dy = py - (mouse.y - height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < params.mouseRadius) {
        const force =
          (1 - dist / params.mouseRadius) * params.force
        const angleAway = Math.atan2(dy, dx)
        px += Math.cos(angleAway) * force
        py += Math.sin(angleAway) * force
      }

      context.beginPath()
      context.arc(px, py, size, 0, Math.PI * 2)
      context.fill()
    }

    context.restore()
  }
}

canvasSketch(sketch, settings)

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

const createPane = () => {
  const pane = new Pane({ title: 'Parameters' })

  const f1 = pane.addFolder({ title: 'Sphere' })
  f1.addBinding(params, 'radius', { min: 50, max: 500, step: 1 }).on(
    'change',
    generatePoints
  )
  f1.addBinding(params, 'latSteps', { min: 10, max: 200, step: 1 }).on(
    'change',
    generatePoints
  )
  f1.addBinding(params, 'lonSteps', { min: 10, max: 200, step: 1 }).on(
    'change',
    generatePoints
  )

  const f2 = pane.addFolder({ title: 'Projection' })
  f2.addBinding(params, 'fov', { min: 100, max: 2000, step: 10 })
  f2.addBinding(params, 'rotationSpeed', { min: 0.001, max: 0.05, step: 0.001 })
  f2.addBinding(params, 'pointSize', { min: 0.1, max: 5, step: 0.1 })

  const f3 = pane.addFolder({ title: 'Mouse Repulsion' })
  f3.addBinding(params, 'mouseRadius', { min: 0, max: 300, step: 1 })
  f3.addBinding(params, 'force', { min: 0, max: 200, step: 1 })
}

createPane()
