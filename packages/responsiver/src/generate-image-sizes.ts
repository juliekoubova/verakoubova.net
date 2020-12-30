import { parseBlock, Block, screenDefs } from "./block-model"
import { getLogicalWidths, LogicalWidth } from './logical-widths'
import { getBlockWidths } from './block-widths'
import { ResponsiverContext } from './context'
import { tryFindAtLeast } from "./utils"


function getTokens(str: string | undefined) {
  return str
    ? str.split(/\s+/).filter(s => s.length !== 0)
    : []
}

export function parseBlockList(element: cheerio.TagElement): Block | undefined {
  const parent = element.parent?.type === "tag"
    ? parseBlockList(element.parent)
    : undefined
  const classes = getTokens(element.attribs['class'])
  return classes.length === 0
    ? parent
    : parseBlock(parent, classes)
}


function pickLegacySize(context: ResponsiverContext, widths: LogicalWidth[]) {
  return tryFindAtLeast(
    widths,
    w => w.appliesUpToScreen.minWidthPx,
    context.legacyViewport,
  )
}

export async function generateImageSizes(
  context: ResponsiverContext,
  el: cheerio.TagElement,
) {
  const { src } = el.attribs
  if (!src) {
    throw new Error(`Image element has no src`)
  }

  const original = await context.originalImages.get(src)
  const block = parseBlockList(el)
  const blockWidths = block ? getBlockWidths(block) : []
  const logicalWidths = getLogicalWidths(blockWidths, context.largestViewport)
  const legacyWidth = pickLegacySize(context, logicalWidths).value

  context.resizedImages.ensureImages(
    original,
    logicalWidths.map(l => l.value)
  )

  return { el, blockWidths, legacyWidth, logicalWidths, original }
}