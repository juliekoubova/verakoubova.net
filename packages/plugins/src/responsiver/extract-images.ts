
const remSizes: [string, number][] = [
  ['', 16],
  ['sm:', 16],
  ['md:', 16],
  ['lg:', 16],
  ['xl:', 20]
]

const classes = {
  'w-64': '16rem',
  'max-w-xs': '20rem',
  'max-w-sm': '24rem',
  'max-w-md': '28rem',
  'max-w-lg': '32rem',
  'max-w-xl': '36rem',
  'max-w-2xl': '42rem',
  'max-w-3xl': '48rem',
  'max-w-4xl': '56rem',
  'max-w-5xl': '64rem',
  'max-w-6xl': '72rem',
}

function parseValue(str: string): { value: number, unit: string } {
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

function getPx(prefixIndex: number, str: string): Set<number> {
  const { value, unit } = parseValue(str)
  if (unit === 'px') {
    return new Set([value])
  }
  if (unit === 'rem') {
    const results = new Set<number>()
    for (; prefixIndex < remSizes.length; prefixIndex++) {
      results.add(remSizes[prefixIndex][1] * value)
    }
    return results
  }
  return new Set()
}

const classWidths = Object.fromEntries(
  remSizes.flatMap(([prefix], prefixIndex) => {
    return Object.entries(classes).map(([className, width]) => {
      const widths = getPx(prefixIndex, width)
      return [prefix + className, widths]
    })
  })
)

function addRange<T>(target: { add(value: T): void }, values: Iterable<T>) {
  for (const v of values) {
    target.add(v)
  }
}

function getTokens(str: string | undefined) {
  return str
    ? str.split(/\s+/).filter(s => s.length !== 0)
    : []
}

function makeMultipliedClassName(className: string, factor = 1) {
  return { className, factor }
}

function parseFactor(token: string) {
  const match = /(.*)([*/])(\d+)$/.exec(token)
  if (match) {
    const num = parseFloat(match[3])
    const factor = match[2] === '/' ? 1 / num : num
    return makeMultipliedClassName(match[1], factor)
  }
  return makeMultipliedClassName(token)
}

function multiply(numbers: number[], factor: number) {
  return numbers.map(num => num * factor)
}

export function getImageWidths($img: Cheerio) {
  const widths = new Set<number>()

  const imgClassNames = new Set([
    ...getTokens($img.attr('class'))
      .map(t => makeMultipliedClassName(t)),
    ...getTokens($img.data('widths'))
      .map(t => parseFactor(t))
  ])

  for (const { className, factor } of imgClassNames) {
    const classNameWidths = className in classWidths
      ? [...classWidths[className]]
      : [] as number[]

    addRange(widths, multiply(classNameWidths, factor))
  }

  return widths
}