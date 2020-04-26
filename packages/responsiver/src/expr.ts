import { Value, isUnitless } from "./value"

export enum ExprType {
  add = 'add',
  literal = 'literal',
  min = 'min',
  multiply = 'multiply',
  subtract = 'subtract',
}

type BinaryExprType =
  | ExprType.add
  | ExprType.min
  | ExprType.multiply
  | ExprType.subtract

export interface BinaryExpr {
  type: BinaryExprType,
  left: Expr,
  right: Expr
}

export interface LiteralExpr {
  type: ExprType.literal
  literal: Value
}

export type Expr =
  | LiteralExpr
  | BinaryExpr

export function isLiteral(expr: Expr): expr is LiteralExpr {
  return expr.type === ExprType.literal
}

export function literalExpr(literal: Value): Expr {
  return { type: ExprType.literal, literal }
}

export function binaryExpr(type: BinaryExprType, left: Expr, right: Expr): Expr {
  return { type, left, right }
}

export const add = binaryExpr.bind(undefined, ExprType.add)
export const subtract = binaryExpr.bind(undefined, ExprType.subtract)
export const multiply = binaryExpr.bind(undefined, ExprType.multiply)

interface LiteralExprReducer {
  identity: number
  apply: (l: number, r: number) => number
}

const LiteralExprReducers: { [key: string]: LiteralExprReducer | undefined } = {
  [ExprType.add]: { identity: 0, apply: (l, r) => l + r },
  [ExprType.subtract]: { identity: 0, apply: (l, r) => l - r },
  [ExprType.multiply]: { identity: 1, apply: (l, r) => l * r }
}

function getResultUnit(left: Value, right: Value) {
  if (isUnitless(left)) {
    return right.unit
  }
  if (isUnitless(right)) {
    return left.unit
  }
  if (left.unit === right.unit) {
    return left.unit
  }
  return undefined
}

export function map<T>(
  mapLiteral: (value: Value) => T,
  mapBinary: (type: BinaryExprType, left: T, right: T) => T,
): (expr: Expr) => T {
  return function mapper(expr: Expr): T {
    if (isLiteral(expr)) {
      return mapLiteral(expr.literal)
    }
    const left = mapper(expr.left)
    const right = mapper(expr.right)
    return mapBinary(expr.type, left, right)
  }
}

export const reduce = map(
  literalExpr,
  (type, left, right) => {
    const reduced: BinaryExpr = { type, left, right }

    const reducer = LiteralExprReducers[type]
    if (!reducer) {
      return reduced
    }

    if (isLiteral(left) && left.literal.value === reducer.identity) {
      return right
    } else if (isLiteral(right) && right.literal.value === reducer.identity) {
      return left
    }

    if (!isLiteral(left) || !isLiteral(right)) {
      return reduced
    }

    const unit = getResultUnit(left.literal, right.literal)
    if (unit === undefined) {
      return reduced
    }

    const result = reducer.apply(left.literal.value, right.literal.value)
    return literalExpr(new Value(result, unit))
  }
)

export const serializeExpr = map(
  literal => literal.toString(),
  (type, left, right) => {
    switch (type) {
      case ExprType.add: return `${left}+${right}`
      case ExprType.subtract: return `${left}-${right}`
      case ExprType.multiply: return `${left}*${right}`
    }
    return `(*TODO ${type}*)`
  }
)

export function hasUnit(unit: string) {
  return map(
    literal => literal.unit === unit,
    (_, left, right) => left || right
  )
}

export function convertUnit(source: string, target: string, multiplier: number) {
  return map(
    literal => literalExpr(
      literal.unit === source
        ? new Value(multiplier * literal.value, target)
        : literal
    ),
    binaryExpr,
  )
}