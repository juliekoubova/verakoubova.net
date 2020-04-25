import { px, addExpr, literalExpr, rem, multiplyExpr, ExprType } from "./expr"

describe('addExpr', () => {
  test(`adds values with same unit`, () => {
    const actual = addExpr(
      literalExpr(px(2)),
      literalExpr(px(4))
    )
    expect(actual).toStrictEqual(
      literalExpr(px(6)),
    )
  })

  test(`adds values with different unit`, () => {
    const actual = addExpr(
      literalExpr(px(2)),
      literalExpr(rem(4))
    )
    expect(actual).toStrictEqual({
      type: ExprType.add,
      left: literalExpr(px(2)),
      right: literalExpr(rem(4)),
    })
  })

  test(`adds values with different unit, removing zeros left`, () => {
    const actual = addExpr(
      literalExpr(px(0)),
      literalExpr(rem(4))
    )
    expect(actual).toStrictEqual(
      literalExpr(rem(4))
    )
  })

  test(`adds values with different unit, removing zeros right`, () => {
    const actual = addExpr(
      literalExpr(px(2)),
      literalExpr(rem(0))
    )
    expect(actual).toStrictEqual(
      literalExpr(px(2))
    )
  })
})

describe('multiplyExpr', () => {
  test('multiplies same units', () => {
    const actual = multiplyExpr(
      literalExpr(px(2)),
      literalExpr(px(3))
    )
    expect(actual).toStrictEqual(
      literalExpr(px(6))
    )
  })
})
