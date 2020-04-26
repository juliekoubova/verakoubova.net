import { ScreenDefinition, Block, screenDefs, ClassDefinition } from './block-model';
import {
  add, literalExpr, isLiteral, Expr, serializeExpr, convertUnit, multiply, subtract, reduce, hasUnit
} from './expr';
import { px, vw } from './value';

export function coalesceSpacing(
  type: 'margin' | 'padding',
  classes: ClassDefinition[]
): Expr {
  const zero = px(0)
  const result = classes.reduce(
    (prev, c) => c.type === type
      ? c.side === 'both' ? [c.value, c.value] :
        c.side === 'start' ? [c.value, prev[1]] :
          c.side === 'end' ? [prev[0], c.value] : prev
      : prev,
    [zero, zero]
  )

  return reduce(add(literalExpr(result[0]), literalExpr(result[1])))
}

export function calcExpressionForScreen(
  screen: ScreenDefinition,
  block: Block
): Expr {

  const appliedScreens = screenDefs
    .filter(s => s.minWidthPx <= screen.minWidthPx)
    .sort((a, b) => a.minWidthPx - b.minWidthPx)

  const appliedClasses =
    appliedScreens.flatMap(s => block.getClasses(s))

  const margin = coalesceSpacing('margin', appliedClasses)
  const padding = coalesceSpacing('padding', appliedClasses)
  const spacing = reduce(add(margin, padding))

  const parent = block.parent
    ? calcExpressionForScreen(screen, block.parent)
    : literalExpr(vw(100))

  for (const c of appliedClasses) {
    if (c.type === 'const') {
      return subtract(literalExpr(c.value), spacing)
    }
    if (c.type === 'factor') {
      return subtract(
        multiply(parent, literalExpr(c.value)),
        spacing
      )
    }
  }

  return subtract(parent, spacing)
}

export function convertRemsToPx(screen: ScreenDefinition, expr: Expr): Expr {
  return convertUnit('rem', 'px', screen.remSizePx)(expr)
}

export interface BlockSizeEntry {
  sameAsPrevious: boolean
  blockSize: Expr
  screen: ScreenDefinition
  screenMaxWidthPx?: number
}

export function serializeBlockSizes(entries: BlockSizeEntry[]) {
  const chunks: string[] = []

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]

    if (entry.sameAsPrevious) {
      continue
    }

    if (entry.screen.minWidthPx) {
      chunks.push('(min-width:')
      chunks.push(entry.screen.minWidthPx.toFixed())
      chunks.push('px) ')
    }
    if (isLiteral(entry.blockSize)) {
      chunks.push(entry.blockSize.literal.toString())
    } else {
      chunks.push('calc(')
      chunks.push(serializeExpr(entry.blockSize))
      chunks.push(')')
    }
    if (i > 0) {
      chunks.push(',')
    }
  }

  return chunks.join('')
}

export function getBlockSizes(block: Block) {

  const hasRem = hasUnit('rem')
  const entries: BlockSizeEntry[] = []

  let previousRem = 0

  for (let i = 0; i < screenDefs.length; i++) {
    const screen = screenDefs[i]
    const prevScreen = i > 0 ? screenDefs[i - 1] : undefined
    const nextScreen = i < screenDefs.length - 1 ? screenDefs[i + 1] : undefined
    const expr = calcExpressionForScreen(screen, block)

    const sameAsPrevious =
      !!prevScreen &&
      (previousRem === screen.remSizePx || !hasRem(expr)) &&
      !block.hasClasses(screen)

    const entry: BlockSizeEntry = {
      blockSize: sameAsPrevious
        ? entries[i - 1].blockSize
        : reduce(convertRemsToPx(screen, expr)),
      sameAsPrevious,
      screen,
      screenMaxWidthPx: nextScreen?.minWidthPx,
    }

    if (!sameAsPrevious) {
      previousRem = screen.remSizePx
    }

    entries.push(entry)
  }

  return entries
}