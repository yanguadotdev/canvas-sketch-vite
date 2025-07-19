import canvasSketch from 'canvas-sketch'
import { Pane } from 'tweakpane'

const FUNCTIONS_INTERPOLATION = {
  easeInOutQuad: 'easeInOutQuad',
  lerp: 'lerp',
}

// Utilities functions
// Calculate distance and delta between two points
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

// Smoothly interpolate a point back to its original position using easing
function easeInOutQuad(targetX, targetY, currentX, currentY, easing) {
  const newX = (targetX - currentX) * easing
  const newY = (targetY - currentY) * easing
  return { newX, newY }
}

// Linear interpolation between two values
function lerp(start, end, t) {
  return start + (end - start) * t
}

// Calculate repulsion offset based on distance and force
function applyRepulsion(dx, dy, dist, repulsionRadius, repulsionStrength) {
  // Calculate force based on how close the point is to the center
  // Value ranges from 1 (center) to 0 (edge of repulsion radius)
  const force = (repulsionRadius - dist) / repulsionRadius

  // Normalize direction vector
  const nx = dx / dist
  const ny = dy / dist

  // Apply force and strength to get offset
  const offsetX = nx * force * repulsionStrength
  const offsetY = ny * force * repulsionStrength

  return { offsetX, offsetY }
}

// Draw a square centered at (x, y)
function drawRect(ctx, x, y, size) {
  ctx.beginPath()
  ctx.rect(x - size / 2, y - size / 2, size, size)
  ctx.stroke()
}

// Draw a circle (or arc) centered at (x, y), optionally rotated
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

function paintByQuadrant(
  ctx,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  point,
  centerX,
  centerY
) {
  if (point.x0 < centerX && point.y0 < centerY) {
    ctx.strokeStyle = topLeft
  } else if (point.x0 >= centerX && point.y0 < centerY) {
    ctx.strokeStyle = topRight
  } else if (point.x0 < centerX && point.y0 >= centerY) {
    ctx.strokeStyle = bottomLeft
  } else {
    ctx.strokeStyle = bottomRight
  }
}

const settings = {
  animate: true,
}

const params = {
  width: 600,
  height: 600,
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
  paintByQuadrant: true,
  colorsByQuadrant: {
    topLeft: '#8338ec',
    topRight: '#fb5607',
    bottomLeft: '#ffbe0b',
    bottomRight: '#3a86ff',
  },
}

let mouse = { x: -9999, y: -9999 }
let points = []

const sketch = () => {
  return ({ context, width, height }) => {
    // Initialize points only once
    if (points.length === 0) {
      const cols = Math.floor(params.width / params.spacing)
      const rows = Math.floor(params.height / params.spacing)
      const startX = width / 2 - params.width / 2
      const startY = height / 2 - params.height / 2

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

    const centerX = width / 2
    const centerY = height / 2

    for (const p of points) {
      if (params.paintByQuadrant) {
        paintByQuadrant(
          context,
          params.colorsByQuadrant.topLeft,
          params.colorsByQuadrant.topRight,
          params.colorsByQuadrant.bottomLeft,
          params.colorsByQuadrant.bottomRight,
          p,
          centerX,
          centerY
        )
      } else {
        context.strokeStyle = params.color
      }

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
    .addBinding(params, 'width', { min: 100, max: 1000, step: 10 })
    .on('change', () => (points = []))
  fGrid
    .addBinding(params, 'height', { min: 100, max: 1000, step: 10 })
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
  fAppearance
    .addBinding(params, 'paintByQuadrant', {
      label: 'paint by quadrant',
    })
    .on('change', (ev) => {
      fQuadrants.hidden = !ev.value
    })

  // Quadrant colors
  const fQuadrants = pane.addFolder({
    title: 'Quadrant Colors',
    hidden: !params.paintByQuadrant,
  })
  fQuadrants.addBinding(params.colorsByQuadrant, 'topLeft', {
    label: 'Top Left',
  })
  fQuadrants.addBinding(params.colorsByQuadrant, 'topRight', {
    label: 'Top Right',
  })
  fQuadrants.addBinding(params.colorsByQuadrant, 'bottomLeft', {
    label: 'Bottom Left',
  })
  fQuadrants.addBinding(params.colorsByQuadrant, 'bottomRight', {
    label: 'Bottom Right',
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
