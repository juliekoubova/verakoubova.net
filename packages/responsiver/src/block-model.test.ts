import { parseBlock, screenDefsByPrefix, defaultScreenDef } from "./block-model"
import { rem, unitless } from "./value"

test(`parses simple class`, () => {
  expect(parseBlock(undefined, ['px-2']).classes).toStrictEqual(
    new Map([
      [
        defaultScreenDef,
        [{ type: 'padding', side: 'both', value: rem(0.5) }]
      ]
    ]),
  )
})

test(`parses multiple classes`, () => {
  expect(parseBlock(undefined, ['px-2', 'max-w-xl']).classes).toStrictEqual(
    new Map([
      [
        defaultScreenDef, [
          { type: 'padding', side: 'both', value: rem(0.5) },
          { type: 'max', value: rem(36) },
        ]
      ]
    ]),
  )
})

test(`parses screen-prefixed class`, () => {
  expect(parseBlock(undefined, ['sm:w-1/2']).classes).toStrictEqual(
    new Map([
      [
        screenDefsByPrefix.sm,
        [{ type: 'factor', value: unitless(0.5) }]
      ]
    ]),
  )
})