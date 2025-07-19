import canvasSketch from 'canvas-sketch'
import { random, math } from 'canvas-sketch-util'
import { Pane } from 'tweakpane'

const settings = {
  animate: true,
}

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  frequency: 0.001,
  amplitude: 0.2,
  animate: true,
  frame: 0,
  speed: 15,
  lineCap: 'butt',
}

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const cols = params.cols
    const rows = params.rows
    const numCells = cols * rows
    const gridw = width * 0.8
    const gridh = height * 0.8
    const cellw = gridw / cols
    const cellh = gridh / rows
    const margx = (width - gridw) * 0.5
    const margy = (height - gridh) * 0.5

    context.strokeStyle = 'white'
    for (let i = 0; i < numCells; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cellw
      const y = row * cellh
      const w = cellw * 0.8
      const h = cellh * 0.8

      const f = params.animate ? frame : params.frame
      const n = random.noise3D(x, y, f * params.speed, params.frequency) // returns a number bettween -1 and 1
      const angle = n * Math.PI * params.amplitude // we get the equivalent -180 and 180 degrees

      // const scale = (n + 1) / 2 * 30
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax)

      context.save()
      context.translate(x, y)
      context.translate(margx, margy)
      context.translate(cellw * 0.5, cellh * 0.5)
      context.rotate(angle)

      context.lineWidth = scale
      context.lineCap = params.lineCap

      context.beginPath()
      context.moveTo(w * -0.5, 0)
      context.lineTo(w * 0.5, 0)
      context.stroke()

      context.restore()
    }
  }
}

const createPane = () => {
  const pane = new Pane({ title: 'Parameters' })

  const f1 = pane.addFolder({ title: 'Grid' })
  f1.addBinding(params, 'lineCap', {
    options: {
      butt: 'butt',
      round: 'round',
      square: 'square',
    },
  })
  f1.addBinding(params, 'cols', { min: 2, max: 50, step: 1 })
  f1.addBinding(params, 'rows', { min: 2, max: 50, step: 1 })

  const f2 = pane.addFolder({ title: 'Scale' })
  f2.addBinding(params, 'scaleMin', { min: 1, max: 100, step: 1 })
  f2.addBinding(params, 'scaleMax', { min: 1, max: 100, step: 1 })

  const f3 = pane.addFolder({ title: 'Noise' })
  f3.addBinding(params, 'frequency', { min: -0.01, max: 0.01 })
  f3.addBinding(params, 'amplitude', { min: 0, max: 1 })

  const f4 = pane.addFolder({ title: 'Animation' })
  f4.addBinding(params, 'animate')
  f4.addBinding(params, 'frame', { min: 0, max: 999, step: 1 })
  f4.addBinding(params, 'speed', { min: 10, max: 100, step: 1 })
}

createPane()
canvasSketch(sketch, settings)
