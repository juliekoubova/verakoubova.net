export class Value {
  constructor(
    readonly value: number,
    readonly unit: string
  ) {
  }

  toString() {
    return `${this.value}${this.unit}`
  }
}

export enum ExprType {
  add = 'add',
  literal = 'literal',
  min = 'min',
  multiply = 'multiply',
  subtract = 'subtract',
}

export interface BinaryExpr {
  type: ExprType.add | ExprType.min | ExprType.multiply | ExprType.subtract,
  left: Expr,
  right: Expr
}

export interface LiteralExpr {
  type: ExprType.literal
  value: Value
}

export type Expr =
  | LiteralExpr
  | BinaryExpr

export function isLiteral(expr: Expr): expr is LiteralExpr {
  return expr.type === ExprType.literal
}

export function literalExpr(value: Value): Expr {
  return { type: ExprType.literal, value }
}

function additionImpl(
  type: BinaryExpr['type'],
  identity: number,
  applyToValues: (l: number, right: number) => number,
  left: Expr,
  right: Expr,
): Expr {
  if (isLiteral(left) && isLiteral(right)) {
    const lval = left.value
    const rval = right.value

    if (lval.value === identity) {
      return right
    }
    if (rval.value === identity) {
      return left
    }
    if (lval.unit === rval.unit) {
      return literalExpr(
        new Value(
          applyToValues(lval.value, rval.value),
          rval.unit
        )
      )
    }
  }
  return { type, left, right }
}

export const addExpr = additionImpl.bind(
  undefined,
  ExprType.add,
  0,
  (l, r) => l + r
)

export const subtractExpr = additionImpl.bind(
  undefined,
  ExprType.subtract,
  0,
  (l, r) => l - r
)

function unitlessToUnit(unitless: LiteralExpr, target: LiteralExpr) {
  return target.value.unit === ''
    ? unitless
    : literalExpr(new Value(unitless.value.value, target.value.unit))
}

export function multiplyExpr(left: Expr, right: Expr) {

  if (isLiteral(left) && isLiteral(right)) {
    const lval = left.value
    const rval = right.value

    if (lval.value === 0 || rval.value === 0) {
      return literalExpr(unitless(0))
    }

    if (lval.unit === '') {
      left = unitlessToUnit(left, right)
    } else if (rval.unit === '') {
      right = unitlessToUnit(right, left)
    }
  }

  return additionImpl(
    ExprType.multiply,
    1,
    (l, r) => l * r,
    left,
    right
  )
}


export function parseValue(str: string): Value {
  if (!str) {
    return { value: NaN, unit: '' }
  }
  const value = parseFloat(str)
  if (isNaN(value)) {
    return { value: NaN, unit: '' }
  }
  const unit = str.replace(/\d|\./g, '')
  return { value, unit }
}

export function px(value: number): Value {
  return new Value(value, 'px')
}


export function rem(value: number): Value {
  return new Value(value, 'rem')
}

export function vw(value: number): Value {
  return new Value(value, 'vw')
}

export function unitless(value: number): Value {
  return new Value(value, '')
}

export function serializeExpr(expr: Expr): string {
  if (isLiteral(expr)) {
    return expr.value.toString()
  }

  if (expr.type === ExprType.add) {
    return `${serializeExpr(expr.left)}+${serializeExpr(expr.right)}`
  }

  if (expr.type === ExprType.subtract) {
    return `${serializeExpr(expr.left)}-${serializeExpr(expr.right)}`
  }

  if (expr.type === ExprType.multiply) {
    return `${serializeExpr(expr.left)}*${serializeExpr(expr.right)}`
  }

  return `(*TODO ${expr.type}*)`
}
export function convertUnit(source: string, target: string) {
  return function (multiplier: number) {
    return function converter(expr: Expr): Expr {
      if (isLiteral(expr)) {
        return expr.value.unit === source
          ? literalExpr(new Value(multiplier * expr.value.value, target))
          : expr
      }

      return {
        type: expr.type,
        left: converter(expr.left),
        right: converter(expr.right),
      }
    }
  }
}