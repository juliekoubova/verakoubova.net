import { add, literalExpr, multiply, ExprType, reduce, subtract, serializeExpr } from "./expr"
import { px, rem, vw, unitless } from "./value"

describe('reduce', () => {
  it(`adds values with same unit`, () => {
    const actual = reduce(add(
      literalExpr(px(2)),
      literalExpr(px(4))
    ))
    expect(actual).toStrictEqual(
      literalExpr(px(6)),
    )
  })

  it(`adds values with different unit`, () => {
    const actual = reduce(add(
      literalExpr(px(2)),
      literalExpr(rem(4))
    ))
    expect(actual).toStrictEqual({
      type: ExprType.add,
      left: literalExpr(px(2)),
      right: literalExpr(rem(4)),
    })
  })

  it(`adds values with different unit, removing zeros left`, () => {
    const actual = reduce(add(
      literalExpr(px(0)),
      literalExpr(rem(4))
    ))
    expect(actual).toStrictEqual(
      literalExpr(rem(4))
    )
  })

  it(`adds values with different unit, removing zeros right`, () => {
    const actual = reduce(add(
      literalExpr(px(2)),
      literalExpr(rem(0))
    ))
    expect(actual).toStrictEqual(
      literalExpr(px(2))
    )
  })

  it('multiplies same units', () => {
    const actual = reduce(multiply(
      literalExpr(px(2)),
      literalExpr(px(3))
    ))
    expect(actual).toStrictEqual(
      literalExpr(px(6))
    )
  })

  it('reduces zero additions', () => {
    const expr = add(
      add(literalExpr(vw(100)), literalExpr(px(5))),
      literalExpr(px(0))
    )

    const actual = reduce(expr)
    expect(actual).toStrictEqual(add(
      literalExpr(vw(100)),
      literalExpr(px(5))
    ))
  })

  it('reduces zero subtractions', () => {
    const expr = subtract(
      subtract(literalExpr(vw(100)), literalExpr(px(5))),
      literalExpr(px(0))
    )

    const actual = reduce(expr)
    expect(actual).toStrictEqual(subtract(
      literalExpr(vw(100)),
      literalExpr(px(5))
    ))
  })
})

describe('serialize', () => {

  it('introduces parens when add is left node multiply', () => {
    const expr = multiply(
      add(literalExpr(px(1)), literalExpr(vw(100))),
      literalExpr(unitless(2))
    )
    const actual = serializeExpr(expr)
    expect(actual).toBe('(1px+100vw)*2')
  })

})