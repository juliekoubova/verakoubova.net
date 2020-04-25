import { parseBlock } from "./sizes"

describe('parseBlock', () => {
  test(`parses simple class`, () => {
    expect(parseBlock(undefined, ['px-2'])).toStrictEqual({
      classes: {
        '': [{ type: 'subtract', value: { value: 1, unit: 'rem' } }]
      },
      parent: undefined,
    })
  })

  test(`parses multiple classes`, () => {
    expect(parseBlock(undefined, ['px-2', 'max-w-xl'])).toStrictEqual({
      classes: {
        '': [
          { type: 'subtract', value: { value: 1, unit: 'rem' } },
          { type: 'max', value: { value: 36, unit: 'rem' } },
        ]
      },
      parent: undefined,
    })
  })

  test(`parses screen-prefixed class`, () => {
    expect(parseBlock(undefined, ['sm:w-1/2'])).toStrictEqual({
      classes: {
        'sm': [ { type: 'factor', value: 0.5 } ]
      },
      parent: undefined,
    })
  })
})