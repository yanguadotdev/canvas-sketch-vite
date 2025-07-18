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

function drawCircle(ctx, x, y, size, typeCircle, startAngleDeg = 0) {
  const typesCircle = {
    complete: 2 * Math.PI,
    semi: Math.PI,
    quarter: Math.PI / 2,
  }

  const startAngle = (startAngleDeg * Math.PI) / 180 // convert degrees to radians
  const endAngle = startAngle + typesCircle[typeCircle]

  ctx.beginPath()
  ctx.arc(x, y, size, startAngle, endAngle)
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
  circle: 'complete',
  repulsionRadius: 80,
  repulsionStrength: 30,
  easing: 0.1,
  interpolation: FUNCTIONS_INTERPOLATION.easeInOutQuad,
  rotation: 0,
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

      const inRepulsion = dist < params.repulsionRadius && dist > 0.01

      if (inRepulsion) {
        const { offsetX, offsetY } = applyRepulsion(
          dx,
          dy,
          dist,
          params.repulsionRadius,
          params.repulsionStrength
        )
        p.x += offsetX
        p.y += offsetY
      } else {
        // Go back easing to original position
        if (params.interpolation === FUNCTIONS_INTERPOLATION.easeInOutQuad) {
          const { newX, newY } = easeInOutQuad(
            p.x0,
            p.y0,
            p.x,
            p.y,
            params.easing
          )
          p.x += newX
          p.y += newY
        } else {
          p.x = lerp(p.x, p.x0, params.easing)
          p.y = lerp(p.y, p.y0, params.easing)
        }
      }

      if (params.shape === 'rect') {
        drawRect(context, p.x, p.y, params.pointSize)
      } else if (params.shape === 'circle') {
        drawCircle(
          context,
          p.x,
          p.y,
          params.pointSize / 2,
          params.circle,
          params.rotation
        )
      } else if (params.shape === 'both') {
        drawCircle(
          context,
          p.x,
          p.y,
          params.pointSize / 4,
          params.circle,
          params.rotation
        )
        drawRect(context, p.x, p.y, params.pointSize)
      }
    }
  }
}

canvasSketch(sketch, settings)

function createPane() {
  const pane = new Pane({ title: 'Parameters' })

  // Grid controls
  const fGrid = pane.addFolder({ title: 'Grid' })
  fGrid
    .addBinding(params, 'size', { min: 100, max: 1000, step: 10 })
    .on('change', () => (points = []))
  fGrid
    .addBinding(params, 'spacing', { min: 5, max: 100, step: 1 })
    .on('change', () => (points = []))
  fGrid.addBinding(params, 'pointSize', { min: 1, max: 20, step: 0.5 })

  // Appearance controls
  const fAppearance = pane.addFolder({ title: 'Appearance' })
  fAppearance.addBinding(params, 'color')
  fAppearance.addBinding(params, 'shape', {
    options: { rect: 'rect', circle: 'circle', both: 'both' },
  })
  fAppearance.addBinding(params, 'circle', {
    options: {
      complete: 'complete',
      semi: 'semi',
      quarter: 'quarter',
    },
  })
  fAppearance.addBinding(params, 'rotation', {
    min: 0,
    max: 360,
    step: 1,
    label: 'start angle',
  })

  // Physics / Repulsion
  const fPhysics = pane.addFolder({ title: 'Physics' })
  fPhysics.addBinding(params, 'repulsionRadius', { min: 10, max: 200, step: 1 })
  fPhysics.addBinding(params, 'repulsionStrength', {
    min: 1,
    max: 100,
    step: 1,
  })

  // Interpolation / Return motion
  const fInterpolation = pane.addFolder({ title: 'Interpolation' })
  fInterpolation.addBinding(params, 'easing', {
    min: 0.01,
    max: 0.5,
    step: 0.01,
  })
  fInterpolation.addBinding(params, 'interpolation', {
    options: FUNCTIONS_INTERPOLATION,
    label: 'function',
  })
}

createPane()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
