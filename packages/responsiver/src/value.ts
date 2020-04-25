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

export function isUnitless(value: Value) {
  return value.unit === ''
}
