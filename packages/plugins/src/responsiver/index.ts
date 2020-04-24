import { cheerioPlugin } from "../cheerio-plugin"
import { getImageWidths } from "./extract-images"
import { join } from 'path'
import * as sharp from 'sharp'

async function loadMetadata(path: string, image: sharp.Sharp) {
  try {
    const { width, height } = await image.metadata()
    if (!height || !width) {
      throw new Error(`@verakoubova/responsiver: Could not load width and height of '${path}'`)
    }
    return { width, height }
  } catch (e) {
    throw new Error(`@verakoubova/responsiver: Error loading metadata of '${path}': ${e}`)
  }
}

async function processImage($img: Cheerio) {
  const src = $img.attr('src')

  if (!src) {
    return
  }

  const path = join(process.cwd(), src)

  const image = sharp(path)
  const { height, width } = await loadMetadata(path, image)
  const aspectRatio = height / width

  const widths = [...getImageWidths($img)].sort().reverse()
  if (widths.length === 0) {
    $img.attr('width', width.toFixed(0))
    $img.attr('height', height.toFixed(0))
  } else {
    $img.attr('width', widths[0].toFixed(0))
    $img.attr('height', (widths[0] * aspectRatio).toFixed(0))
  }
}

export interface ResponsiverOptions {
  imageOutputPath?: string
}

export const responsiver = cheerioPlugin<ResponsiverOptions>(
  'responsiver',
  async ($, _, options = {}) => {
    if (!options.imageOutputPath) {
      throw new Error('@verakoubova/responsiver: imageOutputPath not specifed')
    }

    await Promise.all(
      $('img').toArray().map(img => processImage($(img)))
    )
  })
