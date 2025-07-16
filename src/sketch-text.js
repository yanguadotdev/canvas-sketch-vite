import canvasSketch from 'canvas-sketch'
import { random, math } from 'canvas-sketch-util'

const settings = {
  dimensions: [1080, 1080],
}

let text = 'A'
let fontSize = 1200
let fontFamily = 'monospace'
let manager = null

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    context.fillStyle = 'black'
    context.font = `${fontSize}px ${fontFamily}`
    context.textBaseline = 'top'

    const metrics = context.measureText(text)
    const mx = metrics.actualBoundingBoxLeft * -1
    const my = metrics.actualBoundingBoxAscent * -1
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
    const mh =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    const x = (width - mw) * 0.5 - mx
    const y = (height - mh) * 0.5 - my

    context.save()
    context.translate(x, y)

    context.beginPath()
    context.rect(mx, my, mw, mh)
    context.stroke()

    context.fillText(text, 0, 0)

    context.restore()
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
