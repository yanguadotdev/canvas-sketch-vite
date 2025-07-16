import canvasSketch from 'canvas-sketch'
import { random, math } from 'canvas-sketch-util'

const settings = {
  dimensions: [1080, 1080],
}

let text = 'A'
let fontSize = 1200
let fontFamily = 'monospace'
let manager = null

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')

const sketch = ({ context, width, height }) => {
  const cell = 20
  const cols = Math.floor(width / cell)
  const rows = Math.floor(height / cell)
  const numCells = cols * rows

  typeCanvas.width = cols
  typeCanvas.height = rows

  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black'
    typeContext.fillRect(0, 0, cols, rows)

    fontSize = cols

    typeContext.fillStyle = 'white'
    typeContext.font = `${fontSize}px ${fontFamily}`
    typeContext.textBaseline = 'top'

    const metrics = typeContext.measureText(text)
    const mx = metrics.actualBoundingBoxLeft * -1
    const my = metrics.actualBoundingBoxAscent * -1
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
    const mh =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    const tx = (cols - mw) * 0.5 - mx
    const ty = (rows - mh) * 0.5 - my

    typeContext.save()
    typeContext.translate(tx, ty)

    typeContext.beginPath()
    typeContext.rect(mx, my, mw, mh)
    typeContext.stroke()

    typeContext.fillText(text, 0, 0)

    typeContext.restore()

    const typeData = typeContext.getImageData(0, 0, cols, rows)

    context.drawImage(typeCanvas, 0, 0)

    for (let i = 0; i < numCells; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cell
      const y = row * cell

      const r = typeData.data[(row * cols + col) * 4]
      const g = typeData.data[(row * cols + col) * 4 + 1]
      const b = typeData.data[(row * cols + col) * 4 + 2]

      context.fillStyle = `rgb(${r}, ${g}, ${b})`

      context.save()
      context.translate(x, y)
      context.translate(cell * .5, cell * .5)
      // context.fillRect(0, 0, cell, cell)

      context.beginPath()
      context.arc(0, 0, cell * .5, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }
}

const onKeyUp = (e) => {
  text = e.key.toUpperCase()
  manager.render()
}
document.addEventListener('keyup', onKeyUp)

const start = async () => {
  manager = await canvasSketch(sketch, settings)
}

start()

// const url = 'https://picsum.photos/200'

// const loadMeSomeImage = (url) => {
//   return new Promise((resolve, reject) => {
//     const image = new Image()
//     image.onload = () => resolve(image)
//     image.onerror = () => reject()
//     image.src = url
//   })
// }

// const start = () => {
//   loadMeSomeImage(url).then((image) => {
//     console.log('image width: ' + image.width)
//   })
// }
