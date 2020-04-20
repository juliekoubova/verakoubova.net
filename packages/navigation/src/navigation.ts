import { makeIntersector, makeAttributeObserver, makeEventHandler, wrapController } from '@verakoubova/stimulus'
import { throttle } from 'throttle-debounce'
import { Controller } from 'stimulus'
import { hashEqual, stripHash } from './hash-utils'

export interface InPagePosition {
  hash: string
  id: string | undefined
  title: string
}

export const InPagePositionChangedEvent = 'vek:in-page-navigation'

function dispatchInPageNavigation(detail: InPagePosition) {
  dispatchEvent(
    new CustomEvent<InPagePosition>(
      InPagePositionChangedEvent,
      { bubbles: false, detail }
    )
  )
}

function getElementTitle(element: Element) {
  return element.getAttribute('data-title') || ''
}


function setInPagePosition(element: Element | undefined) {
  const title = element ? getElementTitle(element) : ''
  const id = element?.id ?? ''
  const hash = '#' + id

  if (hashEqual(hash, location.hash)) {
    return
  }

  history.replaceState(history.state, title, hash)
  dispatchInPageNavigation({ hash, id, title })
}

export const queueSetInPagePosition = throttle(128, setInPagePosition)

export function getInPagePosition(): InPagePosition {
  const id = stripHash(location.hash) || undefined
  const element = id && document.getElementById(id) || undefined
  const title = element && getElementTitle(element) || ''
  const hash = '#' + (id ?? '')
  return { hash, id, title }
}

function makeTopElement() {
  const el = document.createElement('div')
  Object.assign(el.style, {
    position: 'absolute',
    pointerEvents: 'none',
    top: '0',
    left: '0',
    right: '0',
    height: '5px'
  })
  el.setAttribute('aria-hidden', 'true')
  document.body.insertAdjacentElement('afterbegin', el)
  return el
}

let topElement: Element | undefined

export class NavigationController extends Controller {

  private readonly intersector = makeIntersector(
    this,
    this.intersect.bind(this),
    { threshold: 0.2 }
  )

  initialize() {
    if (!topElement) {
      topElement = makeTopElement()
    }
    this.intersector.observe(topElement)
    makeAttributeObserver(this, 'id', {
      elementMatchedAttribute: this.intersector.observe,
      elementUnmatchedAttribute: this.intersector.unobserve,
    })
  }

  intersect(entries: IntersectionObserverEntry[]) {
    const intersecting = entries.filter(e => e.isIntersecting)
    for (const entry of intersecting) {
      const target =
        entry.target === topElement ||
          entry.target.hasAttribute('data-navigation-top')
          ? undefined
          : entry.target
      queueSetInPagePosition(target)
    }
  }

  connect() {
    const position = getInPagePosition()
    if (position) {
      dispatchInPageNavigation(position)
    }
  }
}

export function makeNavigationWatcher(
  controller: Controller,
  positionUpdate: (position: InPagePosition) => void,
) {
  makeEventHandler(
    controller,
    window,
    InPagePositionChangedEvent,
    e => positionUpdate((e as CustomEvent<InPagePosition>).detail)
  )
  wrapController(
    controller,
    () => positionUpdate(getInPagePosition())
  )
}