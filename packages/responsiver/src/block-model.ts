import { Value, rem, unitless } from "./value"

export interface ScreenDefinition {
  prefix: string
  minWidthPx: number
  remSizePx: number
}

export type SpacingSide = 'both' | 'start' | 'end'

export type StyleRule =
  | { type: 'const', value: Value }
  | { type: 'factor', value: Value }
  | { type: 'margin', value: Value, side: SpacingSide }
  | { type: 'max', value: Value }
  | { type: 'padding', value: Value, side: SpacingSide }

// todo read from tailwind config
// must be sorted in ascending order by minWidthPx
export const screenDefs: ScreenDefinition[] = [
  { prefix: '', minWidthPx: 0, remSizePx: 16 },
  { prefix: 'sm', minWidthPx: 640, remSizePx: 16 },
  { prefix: 'md', minWidthPx: 768, remSizePx: 16 },
  { prefix: 'lg', minWidthPx: 1024, remSizePx: 16 },
  { prefix: 'xl', minWidthPx: 1280, remSizePx: 20 },
]

export const screenDefsByPrefix = Object.fromEntries(
  screenDefs.map(def => [def.prefix, def] as const)
)

export const defaultScreenDef = screenDefsByPrefix['']

// todo read from tailwind config
export const singleScreenClasses: Record<string, StyleRule> = {
  'px-2': { type: 'padding', value: rem(0.5), side: 'both' },
  'px-4': { type: 'padding', value: rem(1), side: 'both' },
  'w-1/4': { type: 'factor', value: unitless(0.25) },
  'w-1/2': { type: 'factor', value: unitless(0.5) },
  'w-64': { type: 'const', value: rem(16) },
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

export const multiScreenClasses: Record<string, Record<string, StyleRule[]>> = {
  'in-sidebar': {
    'lg': [
      { type: 'const', value: rem(12) },
      { type: 'padding', value: rem(0.75), side: 'end' }
    ]
  },
  'sidebar': {
    'lg': [{ type: 'const', value: rem(40) }]
  },
  'sidebar-container': {
    '': [{ type: 'max', value: rem(40) }],
    'lg': [{ type: 'max', value: rem(54) }]
  }
}

export class Block {
  readonly rules = new Map<ScreenDefinition, StyleRule[]>()

  constructor(
    readonly parent?: Block | undefined
  ) {
  }

  addRule(screen: ScreenDefinition, ...rules: StyleRule[]) {
    for (const c of rules) {
      if (!c) {
        throw new Error('Class must be truthy')
      }
      if (!this.rules.has(screen)) {
        this.rules.set(screen, [])
      }
      this.rules.get(screen)!.push(c)
    }
  }

  getClasses(screen: ScreenDefinition): ReadonlyArray<StyleRule> {
    return this.rules.get(screen) ?? []
  }

  hasClasses(screen: ScreenDefinition): boolean {
    return this.getClasses(screen).length !== 0 ||
      (this.parent?.hasClasses(screen) ?? false)
  }
}

function tryAddSingleScreenClass(result: Block, token: string) {
  const PrefixRegexp = /^(\S+):(\S+)$/
  const match = PrefixRegexp.exec(token)
  const prefix = match ? match[1] : ''
  const className = match ? match[2] : token
  const screen = screenDefsByPrefix[prefix]

  if (!screen) {
    console.warn(`@verakoubova/responsiver: unknown prefix '${prefix}' in class '${token}'.`)
    return
  }

  const rule = singleScreenClasses[className]
  if (rule) {
    result.addRule(screen, rule)
  }
}

function tryAddMultiScreenClass(result: Block, token: string) {
  const def = multiScreenClasses[token]
  if (!def) {
    return
  }
  for (const [screenPrefix, rules] of Object.entries(def)) {
    const screen = screenDefsByPrefix[screenPrefix]
    if (!screen) {
      console.warn(
        `@verakoubova/responsiver: unknown screen prefix '${screenPrefix}' ` +
        `referenced by class '${token}'.`)
      continue
    }
    result.addRule(screen, ...rules)
  }
}

export function parseBlock(parent: Block | undefined, tokens: string[]): Block {
  const result = new Block(parent)
  for (const token of tokens) {
    tryAddSingleScreenClass(result, token)
    tryAddMultiScreenClass(result, token)
  }
  return result
}