import { ScreenDefinition, Block, screenDefs, ClassDefinition, defaultScreenDef } from './class-parsing';
import { addExpr, literalExpr, Expr, Value, subtractExpr, multiplyExpr, vw, serializeExpr } from './expr';

export function coalesceSpacing(
  type: 'margin' | 'padding',
  classes: ClassDefinition[]
): Expr {
  const zero = new Value(0, 'px')
  const result = classes.reduce(
    (prev, c) => c.type === type
      ? c.side === 'both' ? [c.value, c.value] :
        c.side === 'start' ? [c.value, prev[1]] :
          c.side === 'end' ? [prev[0], c.value] : prev
      : prev,
    [zero, zero]
  )

  return addExpr(literalExpr(result[0]), literalExpr(result[1]))
}

export function calcExpressionForScreen(
  prevScreen: ScreenDefinition | undefined,
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
  const spacing = addExpr(margin, padding)

  const parent = block.parent
    ? calcExpressionForScreen(prevScreen, screen, block.parent)
    : literalExpr(vw(100))

  for (const c of appliedClasses) {
    if (c.type === 'const') {
      return subtractExpr(literalExpr(c.value), spacing)
    }
    if (c.type === 'factor') {
      return subtractExpr(
        multiplyExpr(parent, literalExpr(c.value)),
        spacing
      )
    }
  }

  return subtractExpr(parent, spacing)
}

export function calcExpression(block: Block) {

  let prevScreen: ScreenDefinition | undefined
  const expressions: (readonly [ScreenDefinition, Expr])[] = []
  for (const screen of screenDefs) {

    const screenIsSame =
      prevScreen &&
      prevScreen.remSizePx === screen.remSizePx &&
      block.getClasses(screen).length === 0

    if (screenIsSame) {
      continue
    }

    expressions.push(
      [screen, calcExpressionForScreen(prevScreen, screen, block)] as const
    )

    prevScreen = screen
  }

  let result = ''
  for (const [screen, expr] of expressions.reverse()) {
    if (screen !== defaultScreenDef) {
      result += `(min-width: ${screen.minWidthPx}px) `
    }
    result += `calc(${serializeExpr(expr)})`
    if (screen !== defaultScreenDef) {
      result += ', '
    }
  }


  return result
}