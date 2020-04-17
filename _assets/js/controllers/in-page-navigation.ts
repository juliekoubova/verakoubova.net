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

export function setInPagePosition(element: Element | undefined) {

  const title = element ? getElementTitle(element) : ''
  const id = element?.id ?? ''
  const hash = '#' + id

  if (hashEqual(hash, location.hash)) {
    return
  }

  history.replaceState(history.state, title, hash)
  dispatchInPageNavigation({ hash, id, title })
}

export const queueSetInPagePosition = (function () {
  let timerId: number | undefined

  return (element: Element | undefined) => {
    if (timerId) {
      window.clearTimeout(timerId)
    }
    timerId = window.setTimeout(
      setInPagePosition.bind(undefined, element),
      360,
    )
  }
})()

export function getInPagePosition(): InPagePosition {
  const { hash } = location
  const id = stripHash(hash) || undefined
  const element = id && document.getElementById(id) || undefined
  const title = element && getElementTitle(element) || ''
  return { hash, id, title }
}

export class InPageNavigation extends IntersectorController {

  private attributeObserver?: AttributeObserver

  threshold = 0.5

  intersect(entries: IntersectionObserverEntry[]) {

    const current = getInPagePosition()

    for (const entry of entries) {
      if (entry.isIntersecting) {
        queueSetInPagePosition(entry.target)
        return
      }
      const { id } = entry.target
      if (id === current?.id && !entry.isIntersecting) {
        queueSetInPagePosition(undefined)
      }
    }
  }

  connect() {
    super.connect()

    const position = getInPagePosition()
    if (position) {
      dispatchInPageNavigation(position)
    }

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