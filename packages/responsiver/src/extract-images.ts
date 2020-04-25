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
      const widths = new Set() //getPx(prefixIndex, width)
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

export function getLogicalWidths($img: Cheerio) {
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

  $img.data('widths', null)
  return widths
}