import { Block, defaultScreenDef, classDefs } from "./block-model"
import { getLogicalWidths } from "./logical-widths"
import { getBlockSizes } from "./sizes"

test(`returns array of viewport widths if no applicable classes`, () => {
  const block = new Block()
  const sizes = getBlockSizes(block)
  const actual = getLogicalWidths(sizes)
  expect(actual).toStrictEqual([640, 768, 1024, 1280, 3840])
})

test(`returns percentage of viewport`, () => {
  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['w-1/4'])
  const sizes = getBlockSizes(block)
  const actual = getLogicalWidths(sizes)
  expect(actual).toStrictEqual([160, 192, 256, 320, 960])
})

test(`returns fixed width`, () => {
  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['w-64'])
  const sizes = getBlockSizes(block)
  const actual = getLogicalWidths(sizes)
  expect(actual).toStrictEqual([256, 320])
})
