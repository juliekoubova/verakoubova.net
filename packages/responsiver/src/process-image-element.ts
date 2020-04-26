import { join } from 'path'
import { parseBlock, Block, defaultScreenDef } from "./block-model"
import { Format, ResizedImage, ImageWidth, ensureImageDir, loadSourceImage, resizeImage } from "./image"
import { getLogicalWidths } from './logical-widths'
import { getBlockSizes, serializeBlockSizes } from './sizes'

function getTokens(str: string | undefined) {
  return str
    ? str.split(/\s+/).filter(s => s.length !== 0)
    : []
}

export function parseBlockList(element: CheerioElement): Block | undefined {
  const parent = element.parent
    ? parseBlockList(element.parent)
    : undefined
  const classes = getTokens(element.attribs['class'])
  return classes.length === 0
    ? parent
    : parseBlock(parent, classes)
}

const FormatMimeTypes = {
  [Format.jpeg]: 'image/jpeg',
  [Format.webp]: 'image/webp'
}

const PixelDensities = [1, 2, 3]

interface Context {
  $: CheerioStatic
  projectDir: string
  outputDir: string
  urlBase: string
}

function src(context: Context, image: ResizedImage) {
  return context.urlBase + '/' + image.original.id + '/' + image.fileName
}

function srcsetByWidth(context: Context, images: ResizedImage[]) {
  return images
    .map(s => `${src(context, s)} ${s.width.physical.toFixed(0)}w`)
    .join(',')
}

function sortBy<T>(items: Iterable<T>, fn: (value: T) => number) {
  return [...items].sort((a, b) => fn(a) - fn(b))
}

function pickLegacySize(images: ResizedImage[]) {
  const sizesByScreen = sortBy(
    images.filter(i => i.width.pixelDensity === 1),
    i => i.width.targetScreen.minWidthPx
  )
  return sizesByScreen.reduce(
    (prev, current) => prev.width.targetScreen.minWidthPx < 1024 ? current : prev
  )
}

function setImgSrcset(
  context: Context,
  $img: Cheerio,
  sources: Record<Format, ResizedImage[]>
) {
  const jpegs = sources[Format.jpeg]
  if (!jpegs) {
    throw new Error('JPEG file not produced')
  }

  const imgSrc = pickLegacySize(jpegs)
  $img.attr('width', imgSrc.width.logical.toFixed(0))
  $img.attr('height', (imgSrc.width.logical * imgSrc.original.aspectRatio).toFixed(0))
  $img.attr('src', src(context, imgSrc))
}

function convertToPicture(
  context: Context,
  $img: Cheerio,
  sizes: string,
  sources: Record<Format, ResizedImage[]>
) {
  $img.wrap('<picture></picture>')
  const $picture = $img.parent()

  for (const [format, images] of Object.entries(sources)) {
    const $source = context.$('<source/>')
    $source.attr('type', FormatMimeTypes[format as Format])
    $source.attr('sizes', sizes)
    $source.attr('srcset', srcsetByWidth(context, images))
    $source.prependTo($picture)
  }
}


export async function processImageElement(context: Context, img: CheerioElement) {
  const $img = context.$(img)
  const src = $img.attr('src')

  if (!src) {
    return
  }

  const path = join(context.projectDir, src)
  const original = await loadSourceImage(path)

  await ensureImageDir(context.outputDir, original)

  const block = parseBlockList(img)
  const blockSizes = block ? getBlockSizes(block) : []
  const logicalWidths = getLogicalWidths(blockSizes)

  const physicalWidths = logicalWidths.flatMap(
    logical => PixelDensities
      .map(density => new ImageWidth(logical.width, density, logical.screen))
      .filter(w => w.physical <= original.physicalWidth)
  )
  physicalWidths.push(new ImageWidth(original.physicalWidth, 1, defaultScreenDef))

  const sources: Record<string, ResizedImage[]> = Object.fromEntries(
    await Promise.all(
      Object.keys(FormatMimeTypes).map(async format => {
        const sizes = await Promise.all(
          physicalWidths.flatMap(width =>
            resizeImage(context.outputDir, original, width, format)
          )
        )
        return [format, sizes] as const
      })
    )
  )

  setImgSrcset(context, $img, sources)
  convertToPicture(context, $img, serializeBlockSizes(blockSizes), sources)
}
