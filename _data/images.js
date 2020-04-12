const fg = require('fast-glob')
const { createReadStream } = require('fs')
const imageSize = require('probe-image-size')

module.exports = async function loadImageMetadata(...args) {
  const images = await fg('img/**/*.{jpg,jpeg,png}')
  const sizes = await Promise.all(images.map(async (img) => {
    const stream = createReadStream(img)
    try {
      const size = await imageSize(stream)
      return ['/' + img, size]
    } finally {
      stream.destroy()
    }
  }))
  const result = Object.fromEntries(sizes)
  return result
}