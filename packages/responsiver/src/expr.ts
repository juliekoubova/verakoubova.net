import { Value, isUnitless } from "./value"

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

export function add(left: Expr, right: Expr): Expr {
  return { type: ExprType.add, left, right }
}

export function subtract(left: Expr, right: Expr): Expr {
  return { type: ExprType.subtract, left, right }
}

export function multiply(left: Expr, right: Expr): Expr {
  return { type: ExprType.multiply, left, right }
}

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

export function reduce(expr: Expr): Expr {
  if (isLiteral(expr)) {
    return expr
  }

  const { type } = expr
  const left = reduce(expr.left)
  const right = reduce(expr.right)
  const reduced = { type, left, right }

  if (!isLiteral(left) || !isLiteral(right)) {
    return reduced
  }

  const reducer = LiteralExprReducers[type]
  if (!reducer) {
    return reduced
  }

  if (left.literal.value === reducer.identity) {
    return right
  } else if (right.literal.value === reducer.identity) {
    return left
  }

  const unit = getResultUnit(left.literal, right.literal)
  if (unit === undefined) {
    return reduced
  }

  const result = reducer.apply(left.literal.value, right.literal.value)
  return literalExpr(new Value(result, unit))
}

export function serializeExpr(expr: Expr): string {
  if (isLiteral(expr)) {
    return expr.literal.toString()
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

export function convertUnit(source: string, target: string, multiplier: number) {
  return function converter(expr: Expr): Expr {
    if (isLiteral(expr)) {
      return expr.literal.unit === source
        ? literalExpr(new Value(multiplier * expr.literal.value, target))
        : expr
    }
    return {
      type: expr.type,
      left: converter(expr.left),
      right: converter(expr.right),
    }
  }
}