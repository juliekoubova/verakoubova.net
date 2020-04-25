import { Block, defaultScreenDef, classDefs } from "./block-model"
import { getLogicalWidths } from "./logical-widths"
import { getBlockSizes } from "./sizes"

test(`returns empty array if no applicable classes`, () => {
  const block = new Block()
  const sizes = getBlockSizes(block)
  const actual = getLogicalWidths(sizes)
  expect(actual).toBe([])
})

test(`returns fixed width`, () => {
  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['w-64'])
  const sizes = getBlockSizes(block)
  const actual = getLogicalWidths(sizes)
  expect(actual).toBe([256, 320])
})
