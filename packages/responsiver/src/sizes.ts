
interface ScreenDefinition {
  prefix: string
  minWidthPx: number
  remSizePx: number
}

interface Value {
  value: number
  unit: string
}

type ClassDefinition =
  | { type: 'max' | 'width' | 'subtract', value: Value }
  | { type: 'factor', value: number }

function rem(value: number): Value {
  return { value, unit: 'rem' }
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

// todo read from tailwind config
const screens: ScreenDefinition[] = [
  { prefix: 'sm', minWidthPx: 640, remSizePx: 16 },
  { prefix: 'md', minWidthPx: 768, remSizePx: 16 },
  { prefix: 'lg', minWidthPx: 1024, remSizePx: 16 },
  { prefix: 'xl', minWidthPx: 1280, remSizePx: 20 },
]

// todo read from tailwind config
const classDefs: Record<string, ClassDefinition> = {
  'px-2': { type: 'subtract', value: rem(1) },
  'w-1/2': { type: 'factor', value: 0.5 },
  'w-64': { type: 'width', value: rem(16) },
  'max-w-xs': { type: 'max', value: rem(20) },
  'max-w-sm': { type: 'max', value: rem(24) },
  'max-w-md': { type: 'max', value: rem(28) },
  'max-w-lg': { type: 'max', value: rem(32) },
  'max-w-xl': { type: 'max', value: rem(36) },
  'max-w-2xl': { type: 'max', value: rem(42) },
  'max-w-3xl': { type: 'max', value: rem(48) },
  'max-w-4xl': { type: 'max', value: rem(56) },
  'max-w-5xl': { type: 'max', value: rem(64) },
  'max-w-6xl': { type: 'max', value: rem(72) },
}

interface BlockClasses {
  [screen: string]: ClassDefinition[]
}

interface Block {
  classes: BlockClasses
  parent: Block | undefined
}

export function parseBlock(parent: Block | undefined, tokens: string[]): Block {
  const PrefixRegexp = /^(\S+):(\S+)$/
  const result: BlockClasses = {}
  for (const token of tokens) {
    const match = PrefixRegexp.exec(token)
    const screen = match ? match[1] : ''
    const className = match ? match[2] : token

    if (className in classDefs) {
      if (!result[screen]) {
        result[screen] = []
      }
      result[screen].push(classDefs[className])
    }

  }
  return { classes: result, parent }
}