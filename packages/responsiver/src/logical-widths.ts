import { BlockSizeEntry } from "./sizes";
import { convertUnit, isLiteral, reduce, hasUnit } from "./expr";
import { ScreenDefinition } from "./block-model";

export interface LogicalWidth {
  screen: ScreenDefinition,
  width: number
}

export function getLogicalWidths(
  blockSizes: BlockSizeEntry[],
  largestViewport = 3840
): LogicalWidth[] {
  const sizes: LogicalWidth[] = []

  for (const entry of blockSizes) {

    if (entry.sameAsPrevious && !hasUnit('vw')(entry.blockSize)) {
      continue
    }

    const maxWidth = entry.screenMaxWidthPx ?? largestViewport
    const size = convertUnit('vw', 'px', maxWidth * 0.01)(entry.blockSize)

    const reduced = reduce(size)
    if (isLiteral(reduced) && reduced.literal.unit === 'px') {
      sizes.push({ screen: entry.screen, width: reduced.literal.value })
    }
  }

  return sizes.sort((a, b) => a.width - b.width)
}
