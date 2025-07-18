import canvasSketch from 'canvas-sketch'
import { Pane } from 'tweakpane'

const FUNCTIONS_INTERPOLATION = {
  easeInOutQuad: 'easeInOutQuad',
  lerp: 'lerp',
}

// Utilities functions
function getDistance(x1, y1, x2, y2) {
  const dx = x1 - x2
  const dy = y1 - y2
  const dist = Math.sqrt(dx * dx + dy * dy)
  return {
    dx,
    dy,
    dist,
  }
}

function easeInOutQuad(targetX, targetY, currentX, currentY, easing) {
  const newX = (targetX - currentX) * easing
  const newY = (targetY - currentY) * easing
  return { newX, newY }
}

function lerp(start, end, t) {
  return start + (end - start) * t
}

function applyRepulsion(dx, dy, dist, repulsionRadius, repulsionStrength) {
  const force = (repulsionRadius - dist) / repulsionRadius
  const nx = dx / dist
  const ny = dy / dist
  const offsetX = nx * force * repulsionStrength
  const offsetY = ny * force * repulsionStrength

  return { offsetX, offsetY }
}

function drawRect(ctx, x, y, size) {
  ctx.beginPath()
  ctx.rect(x - size / 2, y - size / 2, size, size)
  ctx.stroke()
}

function drawCircle(ctx, x, y, size) {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.stroke()
}

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
  interpolation: FUNCTIONS_INTERPOLATION.easeInOutQuad,
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
      const { dx, dy, dist } = getDistance(p.x, p.y, mouse.x, mouse.y)

      let nx, ny
      // Apply repulsion
      if (dist < params.repulsionRadius && dist > 0.01) {
        const { offsetX, offsetY } = applyRepulsion(
          dx,
          dy,
          dist,
          params.repulsionRadius,
          params.repulsionStrength
        )
        nx = offsetX
        ny = offsetY
      } else {
        // back to original position
        const { newX, newY } = easeInOutQuad(
          p.x0,
          p.y0,
          p.x,
          p.y,
          params.easing
        )
        nx = newX
        ny = newY
      }

      if (params.interpolation === FUNCTIONS_INTERPOLATION.easeInOutQuad) {
        p.x += nx
        p.y += ny
      } else {
        p.x = lerp(p.x, p.x + nx, params.easing)
        p.y = lerp(p.y, p.y + ny, params.easing)
      }

      if (params.shape === 'rect') {
        drawRect(context, p.x, p.y, params.pointSize)
      } else if (params.shape === 'circle') {
        drawCircle(context, p.x, p.y, params.pointSize / 2)
      } else if (params.shape === 'both') {
        drawCircle(context, p.x, p.y, params.pointSize / 4)
        drawRect(context, p.x, p.y, params.pointSize)
      }
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

  const f2 = pane.addFolder({ title: 'Linear Interpolation' })
  f2.addBinding(params, 'interpolation', {
    options: FUNCTIONS_INTERPOLATION,
    label: 'function',
  })
}

createPane()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
