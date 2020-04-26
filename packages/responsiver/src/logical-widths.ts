import { BlockSizeEntry } from "./sizes";
import { convertUnit, isLiteral, reduce, hasUnit } from "./expr";

export function getLogicalWidths(
  blockSizes: BlockSizeEntry[],
  largestViewport = 3840
): number[] {
  const sizes = new Set<number>()

  for (const entry of blockSizes) {

    if (entry.sameAsPrevious && !hasUnit('vw')(entry.blockSize)) {
      continue
    }

    const maxWidth = entry.screenMaxWidthPx ?? largestViewport
    const size = convertUnit('vw', 'px', maxWidth * 0.01)(entry.blockSize)

    const reduced = reduce(size)
    if (isLiteral(reduced) && reduced.literal.unit === 'px') {
      sizes.add(reduced.literal.value)
    }
  }

  return [...sizes].sort((a, b) => a - b)
}
