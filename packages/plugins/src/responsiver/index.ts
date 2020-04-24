import { cheerioPlugin } from "../cheerio-plugin"
import { getImageWidths } from "./extract-images"
import { promises as fsp } from 'fs'
import { join } from 'path'
import * as sharp from 'sharp'
import { loadSourceImage } from "./image"


async function fileExists(path: string) {
  try {
    await fsp.stat(path)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}

async function ensureImage(
  image: sharp.Sharp,
  outputDir: string,
  width: number,
  format: string
) {
  const filename = width.toFixed(0) + format
  const path = join(outputDir, filename)

  if (await fileExists(path)) {
    return
  }

  const resized = image.clone().resize(width)
  const formatted = format === '.webp'
    ? resized.webp()
    : resized.jpeg()

  console.log(path)
  const buffer = await formatted.toBuffer()
  await fsp.writeFile(path, buffer)
}

const PixelDensities = [1, 2, 3]
const Formats = ['.jpeg', '.webp']
const OutputPrefixLength = 1

interface Context {
  projectDir: string
  outputDir: string
  urlBase: string
}

async function processImage(context: Context, $img: Cheerio) {
  const src = $img.attr('src')

  if (!src) {
    return
  }

  const path = join(context.projectDir, src)
  const image = await loadSourceImage(path)

  const imageDir = join(
    context.outputDir,
    image.hash.substr(0, OutputPrefixLength),
    image.hash.substr(OutputPrefixLength)
  )

  await fsp.mkdir(imageDir, { recursive: true })

  const widths = [...getImageWidths($img)].sort().reverse()

  if (widths.length === 0) {
    widths.push(image.width)
  }

  $img.attr('width', widths[0].toFixed(0))
  $img.attr('height', (widths[0] * image.aspectRatio).toFixed(0))

  const physicalWidths = [...new Set(
    widths.flatMap(x => PixelDensities.map(dpi => dpi * x)).filter(
      w => w <= image.width
    )
  )]

  await Promise.all(
    physicalWidths.flatMap(width =>
      Formats.flatMap(format =>
        ensureImage(image.image, imageDir, width, format)
      )
    )
  )
}

export interface ResponsiverOptions {
  outputDir: string
  urlBase: string
}

export const responsiver = cheerioPlugin<ResponsiverOptions>(
  'responsiver',
  async ($, _, options = {}) => {
    const { outputDir = '_site', urlBase = 'i' } = options
    const context = {
      projectDir: process.cwd(),
      outputDir: join(process.cwd(), outputDir, urlBase),
      urlBase
    }

    await fsp.mkdir(context.outputDir, { recursive: true })

    await Promise.all(
      $('img').toArray().map(img => processImage(context, $(img)))
    )
  })
