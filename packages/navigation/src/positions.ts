import { InPagePosition, getPositionFromElement } from './position'
import { createStore } from '@verakoubova/store'

export type PositionsAction =
  | { type: 'add', element: Element }
  | { type: 'remove', element: Element }

function positionsReducer(positions: InPagePosition[], action: PositionsAction) {
  if (action.type === 'add') {
    return [...positions, getPositionFromElement(action.element)]
  } else if (action.type === 'remove' && action.element.id) {
    return positions.filter(pos => pos.id !== action.element.id)
  }
  return positions
}

export const positions = createStore([], positionsReducer)