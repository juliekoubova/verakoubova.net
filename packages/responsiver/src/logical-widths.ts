import { BlockSizeEntry } from "./sizes";
import { convertUnit, isLiteral, reduce, hasUnit, map, literalExpr, ExprType } from "./expr";
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
    const pixels = convertUnit('vw', 'px', maxWidth * 0.01)(entry.blockSize)
    const reduced = reduce(pixels)

    if (isLiteral(reduced) && reduced.literal.unit === 'px') {
      const width = reduced.literal.value
      if (sizes.length === 0 || sizes[sizes.length - 1].width !== width) {
        sizes.push({ screen: entry.screen, width })
      }
    }
  }

  return sizes.sort((a, b) => a.width - b.width)
}
