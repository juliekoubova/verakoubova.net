import { ScreenDefinition, Block, screenDefs, ClassDefinition } from './block-model';
import {
  add, literalExpr, isLiteral, Expr, serializeExpr, convertUnit, multiply, subtract, reduce
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
    .filter(s => !s.minWidthPx || s.minWidthPx <= screen.minWidthPx)
    .sort((a, b) => a.minWidthPx - b.minWidthPx)

  const appliedClasses =
    appliedScreens.flatMap(s => block.getClasses(s))

  const margin = coalesceSpacing('margin', appliedClasses)
  const padding = coalesceSpacing('padding', appliedClasses)
  const spacing = add(margin, padding)

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
  blockSize: Expr
  screenWidthMin: number
  screenWidthMax?: number
}

export function serializeBlockSizes(entries: BlockSizeEntry[]) {
  const chunks: string[] = []

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]

    if (entry.screenWidthMin) {
      chunks.push('(min-width:')
      chunks.push(entry.screenWidthMin.toFixed())
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

  const entries: BlockSizeEntry[] = []

  for (let i = 0; i < screenDefs.length; i++) {
    const screen = screenDefs[i]
    const prevScreen = i > 0 ? screenDefs[i - 1] : undefined
    const screenIsSame =
      prevScreen &&
      prevScreen.remSizePx === screen.remSizePx &&
      block.getClasses(screen).length === 0

    if (screenIsSame) {
      continue
    }

    const expr = calcExpressionForScreen(screen, block)
    const pxExpr = convertRemsToPx(screen, expr)
    const entry: BlockSizeEntry = {
      screenWidthMin: screen.minWidthPx,
      screenWidthMax: i === screenDefs.length - 1
        ? undefined
        : screenDefs[i + 1].minWidthPx,
      blockSize: reduce(pxExpr)
    }

    entries.push(entry)
  }

  return entries
}