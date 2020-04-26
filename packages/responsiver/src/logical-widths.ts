import { Block, screenDefs, screenDefsByPrefix } from "./block-model";
import { BlockSizeEntry } from "./sizes";
import { convertUnit, isLiteral, reduce, serializeExpr } from "./expr";

export function getLogicalWidths(blockSizes: BlockSizeEntry[]): number[] {
  const sizes = new Set<number>()
  const viewportWidths = [
    ...blockSizes.filter(b => b.screenWidthMax).map(b => b.screenWidthMax),
    ...screenDefs.map(s => s.minWidthPx)
  ]

  for (const entry of blockSizes) {
    const size = entry.screenWidthMax === undefined
      ? entry.blockSize
      : convertUnit('vw', 'px', entry.screenWidthMax * 0.01)(entry.blockSize)

    const reduced = reduce(size)
    console.log(`${serializeExpr(entry.blockSize)} => ${serializeExpr(reduced)}`)
    if (isLiteral(reduced) && reduced.literal.unit === 'px') {
      sizes.add(reduced.literal.value)
    }
  }

  return [...sizes].sort()
}
