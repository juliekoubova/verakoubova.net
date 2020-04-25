import { parseBlock, screenDefsByPrefix, defaultScreenDef } from "./class-parsing"

test(`parses simple class`, () => {
  expect(parseBlock(undefined, ['px-2']).classes).toStrictEqual(
    new Map([
      [
        defaultScreenDef,
        [{ type: 'padding', side: 'both', value: { value: 1, unit: 'rem' } }]
      ]
    ]),
  )
})

test(`parses multiple classes`, () => {
  expect(parseBlock(undefined, ['px-2', 'max-w-xl']).classes).toStrictEqual(
    new Map([
      [
        defaultScreenDef, [
          { type: 'padding', side: 'both', value: { value: 1, unit: 'rem' } },
          { type: 'max', value: { value: 36, unit: 'rem' } },
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
        [{ type: 'factor', value: 0.5 }]
      ]
    ]),
  )
})