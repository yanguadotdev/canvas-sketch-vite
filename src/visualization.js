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
  repulsionRadius: 60,
  repulsionStrength: 30,
}

let mouse = { x: -9999, y: -9999 }

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
        let x = startX + i * params.spacing
        let y = startY + j * params.spacing

        const dx = x - mouse.x
        const dy = y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < params.repulsionRadius && distance > 0.01) {
          const force = (params.repulsionRadius - distance) / params.repulsionRadius
          const nx = dx / distance
          const ny = dy / distance
          const offsetX = nx * force * params.repulsionStrength
          const offsetY = ny * force * params.repulsionStrength
          x += offsetX
          y += offsetY
        }

        context.beginPath()
        if (params.shape === 'rect') {
          context.rect(
            x - params.pointSize / 2,
            y - params.pointSize / 2,
            params.pointSize,
            params.pointSize
          )
        } else if (params.shape === 'circle') {
          context.arc(x, y, params.pointSize / 2, 0, Math.PI * 2)
        } else if (params.shape === 'both') {
          context.arc(x, y, params.pointSize / 4, 0, Math.PI * 2)
          context.rect(
            x - params.pointSize / 2,
            y - params.pointSize / 2,
            params.pointSize,
            params.pointSize
          )
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
  pane.addBinding(params, 'repulsionRadius', { min: 10, max: 200, step: 1 })
  pane.addBinding(params, 'repulsionStrength', { min: 1, max: 100, step: 1 })
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
