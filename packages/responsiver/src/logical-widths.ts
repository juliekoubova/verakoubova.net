import { BlockWidthEntry } from "./block-widths";
import { convertUnit, isLiteral, reduce, hasUnit } from "./expr";
import { ScreenDefinition } from "./block-model";

export interface LogicalWidth {
  appliesUpToScreen: ScreenDefinition
  value: number
}

export function getLogicalWidths(
  blockSizes: BlockWidthEntry[],
  largestViewport: number,
): LogicalWidth[] {
  const sizes: LogicalWidth[] = []

  for (const entry of blockSizes) {

    if (sizes.length !== 0) {
      if (entry.sameAsPrevious && !hasUnit('vw')(entry.blockSize)) {
        sizes[sizes.length - 1].appliesUpToScreen = entry.screen
        continue
      }
    }

    const maxWidth = entry.screenMaxWidthPx ?? largestViewport
    const pixels = convertUnit('vw', 'px', maxWidth * 0.01)(entry.blockSize)
    const reduced = reduce(pixels)

    if (isLiteral(reduced) && reduced.literal.unit === 'px') {
      const { value } = reduced.literal
      if (sizes.length === 0 || sizes[sizes.length - 1].value !== value) {
        sizes.push({ appliesUpToScreen: entry.screen, value })
      }
    }
  }

  return sizes.sort((a, b) => a.value - b.value)
}
