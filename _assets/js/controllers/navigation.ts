import { AttributeObserver } from '@stimulus/mutation-observers'
import { IntersectorController } from '../base_controllers/intersector'

export interface InPagePosition {
  hash: string
  id: string | undefined
  title: string
}

function dispatchInPageNavigation(detail: InPagePosition) {
  dispatchEvent(
    new CustomEvent<InPagePosition>(
      'vek:in-page-navigation',
      { bubbles: false, detail }
    )
  )
}

function getElementTitle(element: Element) {
  return element.getAttribute('data-title') || ''
}

function stripHash(s: string) {
  return s.replace(/^#/, '')
}

function hashEqual(a: string, b: string) {
  return stripHash(a) === stripHash(b)
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

function debounce<F extends (this: undefined, ...args: any[]) => void>(
  delay: number,
  fn: F,
): F {
  let timeoutId = 0

  return function (...args: any[]) {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
    const f = fn.bind(undefined, ...args)
    timeoutId = window.setTimeout(f, delay)
  } as F
}

export const queueSetInPagePosition = debounce(128, setInPagePosition)

export function getInPagePosition(): InPagePosition {
  const { hash } = location
  const id = stripHash(hash) || undefined
  const element = id && document.getElementById(id) || undefined
  const title = element && getElementTitle(element) || ''
  return { hash, id, title }
}

export class NavigationController extends IntersectorController {

  threshold = 0.2

  private attributeObserver?: AttributeObserver
  private topElement = document.createElement('div')

  initialize() {
    Object.assign(this.topElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: '5px'
    })
    this.topElement.style.pointerEvents = 'none'
    this.topElement.setAttribute('aria-hidden', 'true')
    document.body.insertAdjacentElement('afterbegin', this.topElement)
  }

  intersect(entries: IntersectionObserverEntry[]) {
    const relevantEntries = entries.filter(
      e => e.isIntersecting && !e.target.hasAttribute('data-navigation-ignore')
    )
    for (const entry of relevantEntries) {
      const target =
        entry.target === this.topElement
          ? undefined
          : entry.target
      queueSetInPagePosition(target)
    }
  }

  connect() {
    super.connect()

    const position = getInPagePosition()
    if (position) {
      dispatchInPageNavigation(position)
    }

    this.observe(this.topElement)
    this.attributeObserver = new AttributeObserver(this.element, 'id', {
      elementMatchedAttribute: element => this.observe(element),
      elementUnmatchedAttribute: element => this.unobserve(element),
    })
    this.attributeObserver.start()
  }

  disconnect() {
    super.disconnect()
    this.attributeObserver?.stop()
    this.attributeObserver = undefined
  }
}