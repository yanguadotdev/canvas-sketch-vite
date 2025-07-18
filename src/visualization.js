import canvasSketch from 'canvas-sketch'
import { Pane } from 'tweakpane'

const settings = {
  animate: true,
}

const params = {
  size: 600,
  spacing: 20,
  pointSize: 12,
  color: '#ffffff',
  shape: 'both',
  repulsionRadius: 80,
  repulsionStrength: 30,
  easing: 0.1,
}

let mouse = { x: -9999, y: -9999 }
let points = []

const sketch = () => {
  return ({ context, width, height }) => {
    // Initialize points only once
    if (points.length === 0) {
      const cols = Math.floor(params.size / params.spacing)
      const rows = cols
      const startX = width / 2 - params.size / 2
      const startY = height / 2 - params.size / 2

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x0 = startX + i * params.spacing
          const y0 = startY + j * params.spacing
          points.push({ x0, y0, x: x0, y: y0 })
        }
      }
    }

    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    context.strokeStyle = params.color

    for (const p of points) {
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < params.repulsionRadius && distance > 0.01) {
        const force =
          (params.repulsionRadius - distance) / params.repulsionRadius
        const nx = dx / distance
        const ny = dy / distance
        const offsetX = nx * force * params.repulsionStrength
        const offsetY = ny * force * params.repulsionStrength

        p.x += offsetX
        p.y += offsetY
      } else {
        // Lerp back to original position
        p.x += (p.x0 - p.x) * params.easing
        p.y += (p.y0 - p.y) * params.easing
      }

      context.beginPath()
      if (params.shape === 'rect') {
        context.rect(
          p.x - params.pointSize / 2,
          p.y - params.pointSize / 2,
          params.pointSize,
          params.pointSize
        )
      } else if (params.shape === 'circle') {
        context.arc(p.x, p.y, params.pointSize / 2, 0, Math.PI * 2)
      } else if (params.shape === 'both') {
        context.arc(p.x, p.y, params.pointSize / 4, 0, Math.PI * 2)
        context.rect(
          p.x - params.pointSize / 2,
          p.y - params.pointSize / 2,
          params.pointSize,
          params.pointSize
        )
      }
      context.stroke()
    }
  }
}

canvasSketch(sketch, settings)

function createPane() {
  const pane = new Pane({ title: 'Parameters' })
  pane.addBinding(params, 'size', { min: 100, max: 1000, step: 10 })
  pane.addBinding(params, 'spacing', { min: 5, max: 100, step: 1 })
  pane.addBinding(params, 'pointSize', { min: 1, max: 20, step: 0.5 })
  pane.addBinding(params, 'repulsionRadius', { min: 10, max: 200, step: 1 })
  pane.addBinding(params, 'repulsionStrength', { min: 1, max: 100, step: 1 })
  pane.addBinding(params, 'easing', { min: 0.01, max: 0.5, step: 0.01 })
  pane.addBinding(params, 'color')
  pane.addBinding(params, 'shape', {
    options: { rect: 'rect', circle: 'circle', both: 'both' },
    label: 'shape',
  })
}

createPane()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
