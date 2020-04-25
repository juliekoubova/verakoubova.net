import { calcExpressionWithParent, coalesceSpacing } from './calc-expression'
import { Block, screenDefsByPrefix, classDefs, defaultScreenDef } from './class-parsing'
import { rem, valueExpr, px, vw, subtractExpr } from './expr'

describe(`coalesceSpacing`, () => {

  test(`ignores other spacing type`, () => {
    const actual = coalesceSpacing(
      'margin',
      [{ type: 'padding', side: 'both', value: rem(1) }]
    )
    expect(actual).toStrictEqual(
      valueExpr(px(0))
    )
  })

  test(`ignores consts`, () => {
    const actual = coalesceSpacing(
      'margin',
      [{ type: 'const', value: rem(1) }]
    )
    expect(actual).toStrictEqual(
      valueExpr(px(0))
    )
  })

  test(`overrides start`, () => {
    const actual = coalesceSpacing(
      'margin',
      [{ type: 'margin', side: 'start', value: rem(1) }]
    )
    expect(actual).toStrictEqual(
      valueExpr(rem(1))
    )
  })

  test(`overrides both`, () => {
    const actual = coalesceSpacing(
      'margin',
      [
        { type: 'margin', side: 'both', value: rem(1) },
      ]
    )
    expect(actual).toStrictEqual(
      valueExpr(rem(2))
    )
  })

  test(`overrides both and then end`, () => {
    const actual = coalesceSpacing(
      'margin',
      [
        { type: 'margin', side: 'both', value: rem(10) },
        { type: 'margin', side: 'end', value: rem(2) },
      ]
    )
    expect(actual).toStrictEqual(
      valueExpr(rem(12))
    )
  })
})

test(`subtracts spacing from 100vw`, () => {
  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['px-4'])

  const actual = calcExpressionWithParent(
    undefined,
    defaultScreenDef,
    block,
    valueExpr(vw(100)),
  )

  expect(actual).toStrictEqual(
    subtractExpr(
      valueExpr(vw(100)),
      valueExpr(rem(2)),
    )
  )
})

test(`returns undefined expression when screen isn't different`, () => {

  const block = new Block()
  block.addClass(defaultScreenDef, classDefs['px-4'])
  block.addClass(screenDefsByPrefix.sm)

  const actual = calcExpressionWithParent(
    defaultScreenDef,
    screenDefsByPrefix.sm,
    block,
    valueExpr(vw(100)),
  )

  expect(actual).toBeUndefined()
})