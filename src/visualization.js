import canvasSketch from 'canvas-sketch'
import { Pane } from 'tweakpane'

const settings = {
  animate: true,
}

const params = {
  size: 600,
  spacing: 20,
  pointSize: 20,
  color: '#ffffff',
  shape: 'both',
  repulsionRadius: 30,
}

let mouse = { x: 0, y: 0 }

function dist(x, y) {
  const dx = mouse.x - x
  const dy = mouse.y - y
  return Math.sqrt(dx * dx + dy * dy)
}

function drawRect(ctx, x, y) {
  ctx.rect(
    x - params.pointSize / 2,
    y - params.pointSize / 2,
    params.pointSize,
    params.pointSize
  )
}

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const cols = Math.floor(params.size / params.spacing)
    const rows = cols
    const startX = width / 2 - params.size / 2
    const startY = height / 2 - params.size / 2

    context.strokeStyle = params.color

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = startX + i * params.spacing
        const y = startY + j * params.spacing

        const distance = dist(x, y)

        if (distance < params.repulsionRadius) continue

        context.beginPath()
        if (params.shape === 'rect') {
          drawRect(context, x, y)
        } else if (params.shape === 'circle') {
          context.arc(x, y, params.pointSize / 2, 0, Math.PI * 2)
        } else if (params.shape === 'both') {
          context.arc(x, y, params.pointSize / 4, 0, Math.PI * 2)
          drawRect(context, x, y)
        }

        context.stroke()
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
  pane.addBinding(params, 'repulsionRadius', { min: 10, max: 100, step: 1 })
  pane.addBinding(params, 'color')
  pane.addBinding(params, 'shape', {
    options: { rect: 'rect', circle: 'circle', both: 'both' },
    label: 'shape',
  })
}

createPane()

// 👇 Listener de movimiento del mouse
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
