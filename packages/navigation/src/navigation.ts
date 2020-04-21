import { makeIntersector, makeAttributeObserver, makeEventHandler } from '@verakoubova/stimulus'
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

const queueSetInPagePosition = throttle(128, setInPagePosition)

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

function isElement(node: EventTarget | null | undefined): node is Element {
  return node &&
    'nodeType' in node &&
    (node as Node).nodeType === Node.ELEMENT_NODE ||
    false
}

function isAnchorElement(node: EventTarget | null | undefined): node is HTMLAnchorElement {
  return isElement(node) && node.tagName === 'A'
}

function getThisDocumentHash(href: string) {
  if (!href) {
    return false
  }

  const { origin, pathname, search } = document.location
  const base = origin + pathname + search

  if (href === base) {
    return '#'
  }
  if (!href.startsWith(base)) {
    return false
  }

  const hash = href.substring(base.length)
  if (hash.length === 0) {
    return '#'
  }

  if (hash.charAt(0) !== '#') {
    return false
  }

  return hash
}

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

    const delegate = {
      elementMatchedAttribute: this.intersector.observe,
      elementUnmatchedAttribute: this.intersector.unobserve,
    }

    makeAttributeObserver(this, 'data-navigation-top', delegate)
    makeAttributeObserver(this, 'id', delegate)
    makeEventHandler(
      this,
      this.element,
      'click',
      e => this.click(e),
    )

    this.intersector.observe(topElement)
  }

  click(e: Event) {
    if (!isAnchorElement(e.target)) {
      return
    }
    const hash = getThisDocumentHash(e.target.href)
    if (!hash) {
      return
    }

    if (hash === '#') {
      scrollTo({ behavior: 'smooth', top: 0 })
      e.preventDefault()
    }

    const id = getHash(hash)
    const element = document.getElementById(id)
    if (!element) {
      return
    }

    element.scrollIntoView({ behavior: 'smooth' })
    e.preventDefault()
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
