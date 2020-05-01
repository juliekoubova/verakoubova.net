import { ResponsiverContext } from "./context"
import { ResizedImage } from "./resized-image"
import { ResizedImageSet } from "./resized-image-cache"
import { serializeBlockWidths, BlockWidthEntry } from "./block-widths"

function src(context: ResponsiverContext, image: ResizedImage) {
  return `/${context.urlBase}/${image.original.id}/${image.fileName}`
}

function srcsetByWidth(context: ResponsiverContext, images: ResizedImage[]) {
  return images
    .map(s => `${src(context, s)} ${s.physicalWidth.toFixed(0)}w`)
    .join(',')
}

export function setImgSrc(
  context: ResponsiverContext,
  $img: Cheerio,
  legacySrc: ResizedImage
) {
  $img.attr('width', legacySrc.physicalWidth.toFixed(0))
  $img.attr('height', (legacySrc.physicalWidth * legacySrc.original.aspectRatio).toFixed(0))
  $img.attr('src', src(context, legacySrc))
}

export function convertToPicture(
  context: ResponsiverContext,
  $: CheerioStatic,
  $img: Cheerio,
  blockSizes: BlockWidthEntry[],
  sources: ResizedImageSet
) {
  $img.wrap('<picture></picture>')
  const $picture = $img.parent()
  const sizes = serializeBlockWidths(blockSizes)

  for (const [format, images] of sources.entries()) {
    const $source = $('<source/>')
    $source.attr('type', format.mimeType)
    $source.attr('sizes', sizes)
    $source.attr('srcset', srcsetByWidth(context, images))
    $source.prependTo($picture)
  }
}
