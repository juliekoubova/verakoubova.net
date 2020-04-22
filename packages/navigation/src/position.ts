import { getHash, hashEqual } from "./hash-utils"
import { createStore, Store } from "@verakoubova/store"
import { throttle } from "throttle-debounce"

export interface InPagePosition {
  id: string | undefined
  title: string
}

function getElementTitle(element: Element) {
  return element.getAttribute('data-title') || ''
}

function getPositionFromLocation(): InPagePosition {
  const id = getHash(location.hash) || undefined
  const element = id && document.getElementById(id) || undefined
  const title = element && getElementTitle(element) || ''
  return { id, title }
}

export function getPositionFromElement(element: Element | undefined): InPagePosition {
  const title = element ? getElementTitle(element) : ''
  const id = element?.id
  return { id, title }
}

export const currentPosition = createStore(
  getPositionFromLocation()
)

function setInPagePosition(element: Element | undefined) {
  const position = getPositionFromElement(element)
  const hash = '#' + (position.id ?? '')

  if (hashEqual(hash, location.hash)) {
    return
  }

  history.replaceState(history.state, position.title, hash)
  currentPosition.dispatch(position)
}

export const queueSetInPagePosition = throttle(128, setInPagePosition)

