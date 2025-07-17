// orbit.js
import canvasSketch from 'canvas-sketch'
import math from 'canvas-sketch-util/math'
import { Pane } from 'tweakpane'

const settings = {
  animate: true,
}

const params = {
  radius: 300,
  latSteps: 60,
  lonSteps: 60,
  rotationSpeed: 0.005,
  fov: 1500,
  pointSize: 0.8,
  mouseRadius: 100,
  force: 75,
  baseColor: '#ffffff',
  nearColor: '#00ffff',
  rotationAxis: 'y', // 'x' or 'y'
  renderMode: 'points', // 'points' or 'grid'
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

    for (let i = 0; i < params.latSteps; i++) {
      for (let j = 0; j < params.lonSteps; j++) {
        const index = i * params.lonSteps + j
        let p = points[index]
        if (!p) continue

        let x = p.x
        let y = p.y
        let z = p.z

        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        if (params.rotationAxis === 'y') {
          const newX = x * cos - z * sin
          const newZ = x * sin + z * cos
          x = newX
          z = newZ
        } else if (params.rotationAxis === 'x') {
          const newY = y * cos - z * sin
          const newZ = y * sin + z * cos
          y = newY
          z = newZ
        }

        const scale = fov / (fov + z)
        let px = x * scale
        let py = y * scale
        const size = scale * params.pointSize

        const dx = px - (mouse.x - width / 2)
        const dy = py - (mouse.y - height / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)

        const color =
          dist < params.mouseRadius ? params.nearColor : params.baseColor
        context.fillStyle = color
        context.strokeStyle = color

        if (dist < params.mouseRadius) {
          const force = (1 - dist / params.mouseRadius) * params.force
          const angleAway = Math.atan2(dy, dx)
          px += Math.cos(angleAway) * force
          py += Math.sin(angleAway) * force
        }

        if (params.renderMode === 'points') {
          context.beginPath()
          context.arc(px, py, size, 0, Math.PI * 2)
          context.fill()
        } else if (params.renderMode === 'grid') {
          // Dibujar líneas con el punto de la derecha y el de abajo si existen
          if (j < params.lonSteps - 1) {
            const right = points[i * params.lonSteps + (j + 1)]
            if (right) {
              let rx = right.x
              let ry = right.y
              let rz = right.z

              if (params.rotationAxis === 'y') {
                const newX = rx * cos - rz * sin
                const newZ = rx * sin + rz * cos
                rx = newX
                rz = newZ
              } else if (params.rotationAxis === 'x') {
                const newY = ry * cos - rz * sin
                const newZ = ry * sin + rz * cos
                ry = newY
                rz = newZ
              }

              const rscale = fov / (fov + rz)
              const rpx = rx * rscale
              const rpy = ry * rscale

              context.beginPath()
              context.moveTo(px, py)
              context.lineTo(rpx, rpy)
              context.stroke()
            }
          }

          if (i < params.latSteps - 1) {
            const below = points[(i + 1) * params.lonSteps + j]
            if (below) {
              let bx = below.x
              let by = below.y
              let bz = below.z

              if (params.rotationAxis === 'y') {
                const newX = bx * cos - bz * sin
                const newZ = bx * sin + bz * cos
                bx = newX
                bz = newZ
              } else if (params.rotationAxis === 'x') {
                const newY = by * cos - bz * sin
                const newZ = by * sin + bz * cos
                by = newY
                bz = newZ
              }

              const bscale = fov / (fov + bz)
              const bpx = bx * bscale
              const bpy = by * bscale

              context.beginPath()
              context.moveTo(px, py)
              context.lineTo(bpx, bpy)
              context.stroke()
            }
          }
        }
      }
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
  f2.addBinding(params, 'pointSize', { min: 0.4, max: 3, step: 0.1 })
  f2.addBinding(params, 'rotationAxis', {
    options: { y: 'y', x: 'x' },
    label: 'Rotation Axis',
  })
  f2.addBinding(params, 'renderMode', {
    options: { points: 'points', grid: 'grid' },
    label: 'Render Mode',
  })

  const f3 = pane.addFolder({ title: 'Mouse Repulsion' })
  f3.addBinding(params, 'mouseRadius', { min: 0, max: 300, step: 1 })
  f3.addBinding(params, 'force', { min: 0, max: 200, step: 1 })

  const f4 = pane.addFolder({ title: 'Colors' })
  f4.addBinding(params, 'baseColor', { label: 'Far Color' })
  f4.addBinding(params, 'nearColor', { label: 'Near Color' })
}

createPane()
