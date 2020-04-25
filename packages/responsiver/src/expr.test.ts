import { px, addExpr, valueExpr, rem, Value } from "./expr"

describe('addExpr', () => {
  test(`adds values with same unit`, () => {
    const actual = addExpr(
      valueExpr(px(2)),
      valueExpr(px(4))
    )
    expect(actual).toStrictEqual({
      type: 'value',
      value: px(6),
    })
  })

  test(`adds values with different unit`, () => {
    const actual = addExpr(
      valueExpr(px(2)),
      valueExpr(rem(4))
    )
    expect(actual).toStrictEqual({
      type: 'add',
      left: { type: 'value', value: px(2) },
      right: { type: 'value', value: rem(4) }
    })
  })

  test(`adds values with different unit, removing zeros left`, () => {
    const actual = addExpr(
      valueExpr(px(0)),
      valueExpr(rem(4))
    )
    expect(actual).toStrictEqual({
      type: 'value',
      value: rem(4)
    })
  })

  test(`adds values with different unit, removing zeros right`, () => {
    const actual = addExpr(
      valueExpr(px(2)),
      valueExpr(rem(0))
    )
    expect(actual).toStrictEqual({
      type: 'value',
      value: px(2)
    })
  })

})