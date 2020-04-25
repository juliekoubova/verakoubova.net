import { cheerioPlugin } from "@verakoubova/plugins"
import { getLogicalWidths } from "./extract-images"
import { promises as fsp } from 'fs'
import { join } from 'path'
import * as sharp from 'sharp'
import { loadSourceImage, OriginalImage } from "./image"

enum Format {
  jpeg = '.jpeg',
  webp = '.webp'
}

const FormatMimeTypes = {
  [Format.jpeg]: 'image/jpeg',
  [Format.webp]: 'image/webp'
}

const PixelDensities = [1, 2, 3]

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

interface Context {
  $: CheerioStatic
  htmlDocument: string
  projectDir: string
  outputDir: string
  urlBase: string
}

class ImageWidth {
  constructor(
    readonly logical: number,
    readonly pixelDensity: number
  ) {
  }

  get physical() {
    return this.logical * this.pixelDensity
  }
}

interface ResizedImage {
  fileName: string
  format: string
  original: OriginalImage
  width: ImageWidth
}

async function resizeImage(
  context: Context,
  original: OriginalImage,
  width: ImageWidth,
  format: string
): Promise<ResizedImage> {
  const fileName = width.physical.toFixed(0) + format
  const path = join(context.outputDir, original.id, fileName)
  const result = { fileName, format, original, width }

  if (await fileExists(path)) {
    return result
  }

  const resized = sharp(original.path).resize(width.physical)
  if (format === Format.webp) {
    await resized.webp().toFile(path)
  } else {
    await resized.jpeg().toFile(path)
  }

  return result
}

function src(context: Context, image: ResizedImage) {
  return context.urlBase + '/' + image.original.id + '/' + image.fileName
}

function srcsetByDensity(context: Context, images: ResizedImage[]) {
  return images
    .map(s => `${src(context, s)} ${s.width.pixelDensity.toFixed(0)}x`)
    .join(',')
}

function srcsetByWidth(context: Context, images: ResizedImage[]) {
  return images
    .map(s => `${src(context, s)} ${s.width.physical.toFixed(0)}w`)
    .join(',')
}

function setImgSrcset(
  context: Context,
  $img: Cheerio,
  sources: Record<Format, ResizedImage[]>
) {
  const { [Format.jpeg]: jpegs } = sources

  if (!jpegs) {
    throw new Error('JPEG file not produced')
  }

  // the legacy <img> tag gets created as follows:
  // * src is the logically largest JPEG at 1x density
  // * srcset is the logically largest JPEG at all densities

  const largestLogicalWidth = jpegs
    .map(x => x.width.logical)
    .reduce((x, y) => x > y ? x : y)

  const imgSrcset = jpegs.filter(x => x.width.logical === largestLogicalWidth)
  const imgSrc = imgSrcset.find(x => x.width.pixelDensity === 1)!

  $img.attr('width', imgSrc.width.logical.toFixed(0))
  $img.attr('height', (imgSrc.width.logical * imgSrc.original.aspectRatio).toFixed(0))
  $img.attr('src', src(context, imgSrc))
  $img.attr('srcset', srcsetByDensity(context, imgSrcset))

}

function convertToPicture(
  context: Context,
  $img: Cheerio,
  sources: Record<Format, ResizedImage[]>
) {
  // $img.wrap('<picture></picture>')
  // const $picture = $img.parent()

  // for (const [format, sizes] of Object.entries(sources)) {
  //   const $source = context.$('<source/>')
  //   $source.attr('type', FormatMimeTypes[format as Format])
  //   $source.attr('srcset', srcset(context, sizes))
  //   $source.prependTo($picture)
  // }
}

async function processImage(context: Context, img: CheerioElement) {
  const $img = context.$(img)
  const src = $img.attr('src')

  if (!src) {
    return
  }

  const path = join(context.projectDir, src)
  const original = await loadSourceImage(path)

  const imageOutputDir = join(context.outputDir, original.id)
  await fsp.mkdir(imageOutputDir, { recursive: true })

  const logicalWidths = [...getLogicalWidths($img)]
  if (logicalWidths.length === 0) {
    console.warn(`Image '${original.path}' in '${context.htmlDocument}' doesn't specify a width.`)
    logicalWidths.push(original.physicalWidth)
  }

  const physicalWidths = logicalWidths.flatMap(
    logical => PixelDensities
      .map(density => new ImageWidth(logical, density))
      .filter(w => w.physical <= original.physicalWidth)
  )

  const sources: Record<string, ResizedImage[]> = Object.fromEntries(
    await Promise.all(
      Object.keys(FormatMimeTypes).map(async format => {
        const sizes = await Promise.all(
          physicalWidths.flatMap(width =>
            resizeImage(context, original, width, format)
          )
        )
        return [format, sizes] as const
      })
    )
  )

  setImgSrcset(context, $img, sources)
  convertToPicture(context, $img, sources)
}

export interface ResponsiverOptions {
  outputDir: string
  urlBase: string
}

export const responsiver = cheerioPlugin<ResponsiverOptions>(
  'responsiver',
  async ($, outputPath, options = {}) => {
    if (typeof outputPath !== 'string') {
      return
    }

    const { outputDir = '_site', urlBase = '/i' } = options
    const context = {
      $,
      projectDir: process.cwd(),
      outputDir: join(process.cwd(), outputDir, urlBase),
      htmlDocument: outputPath,
      urlBase
    }

    await fsp.mkdir(context.outputDir, { recursive: true })

    await Promise.all(
      $('img').toArray().map(img => processImage(context, img))
    )
  }
)