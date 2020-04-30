import { cheerioPlugin } from "@verakoubova/plugins"
import { generateImageSizes } from "./generate-image-sizes"
import { resolve, join } from 'path'
import { OriginalImageCache } from "./original-image-cache"
import { ResizedImageCache } from "./resized-image-cache"
import { ResponsiverContext } from "./context"
import { setImgSrc, convertToPicture } from "./update-dom"
import { JPEG } from "./image-formats"

type Truthy<T> = Exclude<T, undefined | null | 0 | '' | false>

function isTruthy<T>(value: T): value is Truthy<T> {
  return !!value
}

function ensureTruthy<T>(
  value: T,
  message: string
): Truthy<T> {
  if (isTruthy(value)) {
    return value
  } else {
    throw new Error(message)
  }
}

export interface ResponsiverOptions {
  cacheDir: string
  outputDir: string
  pixelDensities: number[]
  urlBase: string
}

export const responsiver = (options: Partial<ResponsiverOptions> = {}) => {

  const {
    cacheDir = '../../.imagecache',
    outputDir = '_site',
    urlBase = 'i',
    pixelDensities = [1, 1.25, 1.5, 2, 3]
  } = options

  const resolvedCacheDir = resolve(process.cwd(), cacheDir)
  const resolvedOutputDir = resolve(process.cwd(), join(outputDir, urlBase))

  const originalImages = new OriginalImageCache(
    process.cwd(),
  )

  const resizedImages = new ResizedImageCache(
    resolvedCacheDir,
    resolvedOutputDir,
    pixelDensities,
  )

  const context: ResponsiverContext = {
    originalImages,
    resizedImages,
    urlBase
  }

  return cheerioPlugin('responsiver', async ($, _outputPath) => {
    const entries = await Promise.all(
      $('img').toArray().map(img => generateImageSizes(context, img))
    )
    const resized = await resizedImages.writeResizedImages()
    for (const entry of entries) {
      const images = ensureTruthy(
        resized.get(entry.original),
        `No resized images for "${entry.original.path}".`
      )
      const jpegs = ensureTruthy(
        images.get(JPEG),
        `No JPEG images for "${entry.original.path}".`
      )
      const legacyJpeg = ensureTruthy(
        jpegs.find(jpeg => jpeg.physicalWidth === entry.legacyWidth.width),
        `JPEG with width of ${entry.legacyWidth.width}px not found ` +
        `for "${entry.original.path}".`
      )
      const $img = $(entry.el)
      setImgSrc(context, $img, legacyJpeg)
      convertToPicture(context, $, $img, entry.blockWidths, images)
    }
  })
}