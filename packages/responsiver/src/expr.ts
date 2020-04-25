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

export interface BinaryExpr {
  type: 'min' | 'add' | 'subtract' | 'multiply',
  left: Expr,
  right: Expr
}

export type Expr =
  | { type: 'value', value: Value }
  | BinaryExpr

export function valueExpr(value: Value): Expr {
  return { type: 'value', value }
}

function combineExprWithIdentity(
  type: BinaryExpr['type'],
  identity: number,
  applyToValues: (l: number, rigth: number) => number,
  left: Expr,
  right: Expr,
): Expr {
  if (left.type === 'value' && right.type === 'value') {
    if (left.value.value === identity) {
      return right
    }
    if (right.value.value === identity) {
      return left
    }
    if (left.value.unit === right.value.unit) {
      return valueExpr(
        new Value(
          applyToValues(left.value.value, right.value.value),
          left.value.unit
        )
      )
    }
  }
  return { type, left, right }
}

export const addExpr = combineExprWithIdentity.bind(
  undefined,
  'add',
  0,
  (l, r) => l + r
)

export const subtractExpr = combineExprWithIdentity.bind(
  undefined,
  'subtract',
  0,
  (l, r) => l - r
)

export const multiplyExpr = combineExprWithIdentity.bind(
  undefined,
  'multiply',
  1,
  (l, r) => l * r
)


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