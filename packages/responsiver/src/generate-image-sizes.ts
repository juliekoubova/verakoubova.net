import { parseBlock, Block } from "./block-model"
import { getLogicalWidths, LogicalWidth } from './logical-widths'
import { getBlockWidths } from './block-widths'
import { ResponsiverContext } from './context'
import { sortBy } from "./utils/sort-by"


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


function pickLegacySize(widths: LogicalWidth[]) {
  const sizesByScreen = sortBy(
    widths,
    w => w.screen.minWidthPx
  )
  return sizesByScreen.reduce(
    (prev, current) => prev.screen.minWidthPx < 1024 ? current : prev
  )
}

export async function generateImageSizes(
  context: ResponsiverContext,
  el: CheerioElement,
) {
  const { src } = el.attribs
  if (!src) {
    throw new Error(`Image element has no src`)
  }

  const original = await context.originalImages.get(src)
  const block = parseBlockList(el)
  const blockWidths = block ? getBlockWidths(block) : []
  const logicalWidths = getLogicalWidths(blockWidths)
  const legacyWidth = pickLegacySize(logicalWidths)

  context.resizedImages.ensureImages(
    original,
    [...logicalWidths.map(l => l.width), original.physicalWidth]
  )

  return { el, blockWidths, legacyWidth, logicalWidths, original }
}