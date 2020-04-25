export interface Value {
  value: number
  unit: string
}

export type Expr =
  | { type: 'value', value: Value }
  | { type: 'min' | 'add' | 'subtract' | 'multiply', left: Expr, right: Expr }

export function valueExpr(value: Value): Expr {
  return { type: 'value', value }
}

export function addExpr(left: Expr, right: Expr): Expr {
  if (left.type === 'value' && right.type === 'value') {
    if (left.value.value === 0) {
      return right
    }
    if (right.value.value === 0) {
      return left
    }
    if (left.value.unit === right.value.unit) {
      return {
        type: 'value',
        value: {
          unit: left.value.unit,
          value: left.value.value + right.value.value,
        }
      }
    }
  }

  return { type: 'add', left, right }
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
  return { value, unit: 'px' }
}


export function rem(value: number): Value {
  return { value, unit: 'rem' }
}

