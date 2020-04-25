import { ScreenDefinition, Block, screenDefs, ClassDefinition } from './class-parsing';
import { addExpr, valueExpr, Expr } from './expr';

export function coalesceSpacing(
  type: 'margin' | 'padding',
  classes: ClassDefinition[]
): Expr {
  const zero = { value: 0, unit: 'px' }
  const result = classes.reduce(
    (prev, c) => c.type === type
      ? c.side === 'both' ? [c.value, c.value] :
        c.side === 'start' ? [c.value, prev[1]] :
          c.side === 'end' ? [prev[0], c.value] : prev
      : prev,
    [zero, zero]
  )

  return addExpr(valueExpr(result[0]), valueExpr(result[1]))
}
export function calcExpressionWithParent(
  prevScreen: ScreenDefinition | undefined,
  screen: ScreenDefinition,
  block: Block,
  parent: Expr,
) {
  const screenIsDifferent =
    !prevScreen ||
    prevScreen.remSizePx !== screen.remSizePx ||
    (block.classes.get(screen)?.length ?? 0) !== 0

  if (!screenIsDifferent) {
    return undefined
  }

  const appliedScreens = screenDefs
    .filter(s => !s.minWidthPx || s.minWidthPx <= screen.minWidthPx)
    .sort((a, b) => a.minWidthPx - b.minWidthPx)

  const margin = coalesceSpacing(
    'margin',
    appliedScreens.flatMap(s => block.getClasses(s))
  )

  const padding = coalesceSpacing(
    'padding',
    appliedScreens.flatMap(s => block.getClasses(s))
  )

  throw new Error('not implemented')
}

export function calcExpression(screen: ScreenDefinition, block: Block) {

  throw new Error('not implemented')


}