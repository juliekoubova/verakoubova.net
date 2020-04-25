import { Block, defaultScreenDef, classDefs } from "./block-model"
import { getLogicalWidths } from "./logical-widths"

test(`returns empty array if no applicable classes`, () => {
  const block = new Block()
  const actual = getLogicalWidths(block)
  expect(actual).toBe([])
})

test(`returns fixed width`, () => {
  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['w-64'])
  const actual = getLogicalWidths(block)
  expect(actual).toBe([256, 320])
})
