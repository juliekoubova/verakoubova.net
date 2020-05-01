import { Block, defaultScreenDef, singleScreenClasses, screenDefsByPrefix } from "./block-model"
import { getLogicalWidths, LogicalWidth } from "./logical-widths"
import { getBlockWidths } from "./block-widths"

test(`returns array of viewport widths if no applicable classes`, () => {
  const block = new Block()
  const sizes = getBlockWidths(block)
  const actual = getLogicalWidths(sizes, 3840)
  expect(actual).toStrictEqual<LogicalWidth[]>([
    { value: 640, appliesUpToScreen: defaultScreenDef },
    { value: 768, appliesUpToScreen: screenDefsByPrefix.sm },
    { value: 1024, appliesUpToScreen: screenDefsByPrefix.md },
    { value: 1280, appliesUpToScreen: screenDefsByPrefix.lg },
    { value: 3840, appliesUpToScreen: screenDefsByPrefix.xl },
  ])
})

test(`returns percentage of viewport`, () => {
  const block = new Block()
  block.addRule(defaultScreenDef, singleScreenClasses['w-1/4'])
  const sizes = getBlockWidths(block)
  const actual = getLogicalWidths(sizes, 3840)
  expect(actual).toStrictEqual<LogicalWidth[]>([
    { value: 160, appliesUpToScreen: defaultScreenDef },
    { value: 192, appliesUpToScreen: screenDefsByPrefix.sm },
    { value: 256, appliesUpToScreen: screenDefsByPrefix.md },
    { value: 320, appliesUpToScreen: screenDefsByPrefix.lg },
    { value: 960, appliesUpToScreen: screenDefsByPrefix.xl },
  ])
})

test(`returns fixed width`, () => {
  const block = new Block()
  block.addRule(defaultScreenDef, singleScreenClasses['w-64'])
  const sizes = getBlockWidths(block)
  const actual = getLogicalWidths(sizes, 3840)
  expect(actual).toStrictEqual<LogicalWidth[]>([
    { value: 256, appliesUpToScreen: screenDefsByPrefix.lg },
    { value: 320, appliesUpToScreen: screenDefsByPrefix.xl },
  ])
})

test(`returns max width for min expr`, () => {
  const block = new Block()
  block.addRule(defaultScreenDef, singleScreenClasses['max-w-2xl'])
  const sizes = getBlockWidths(block)
  const actual = getLogicalWidths(sizes, 3840)
  expect(actual).toStrictEqual<LogicalWidth[]>([
    { value: 640, appliesUpToScreen: defaultScreenDef },
    { value: 672, appliesUpToScreen: screenDefsByPrefix.sm },
    { value: 840, appliesUpToScreen: screenDefsByPrefix.xl },
  ])
})