import { makeIntersector, makeAttributeObserver } from '@verakoubova/stimulus'
import { createStore } from '@verakoubova/store'
import { throttle } from 'throttle-debounce'
import { Controller } from 'stimulus'
import { hashEqual, getHash } from './hash-utils'

export interface InPagePosition {
  id: string | undefined
  title: string
}

function getInPagePosition(): InPagePosition {
  const id = getHash(location.hash) || undefined
  const element = id && document.getElementById(id) || undefined
  const title = element && getElementTitle(element) || ''
  return { id, title }
}

export const currentPosition = createStore<InPagePosition>(
  getInPagePosition()
)

function getElementTitle(element: Element) {
  return element.getAttribute('data-title') || ''
}

function setInPagePosition(element: Element | undefined) {
  const title = element ? getElementTitle(element) : ''
  const id = element?.id
  const hash = '#' + (id ?? '')

  if (hashEqual(hash, location.hash)) {
    return
  }

  history.replaceState(history.state, title, hash)
  currentPosition.dispatch({ id, title })
}

export const queueSetInPagePosition = throttle(128, setInPagePosition)

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
}
