import { Block } from "./block-model";
import { BlockSizeEntry } from "./sizes";
import { convertUnit } from "./expr";

export function getLogicalWidths(blockSizes: BlockSizeEntry[]): number[] {
  const sizes = new Set<number>()

  for (const entry of blockSizes) {
    if (entry.screenWidthMax) {
      convertUnit('vw', 'px', entry.screenWidthMax * 0.01)(entry.blockSize)

    }
  }

  return []
}
