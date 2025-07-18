import canvasSketch from 'canvas-sketch'
import { Pane } from 'tweakpane'

const settings = {
  animate: true,
}

const params = {
  size: 500,
  spacing: 20,
  pointSize: 4,
  color: '#ffffff',
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

        context.beginPath()
        context.arc(x, y, params.pointSize, 0, Math.PI * 2)
        context.stroke()
      }
    }
  }
}

canvasSketch(sketch, settings)

function createPane() {
  const pane = new Pane()
  pane.addBinding(params, 'size', { min: 100, max: 1000, step: 10 })
  pane.addBinding(params, 'spacing', { min: 5, max: 100, step: 1 })
  pane.addBinding(params, 'pointSize', { min: 1, max: 10, step: 0.5 })
  pane.addBinding(params, 'color')
}

createPane()
