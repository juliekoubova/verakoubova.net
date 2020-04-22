import { makeIntersector, makeAttributeObserver, combineAttributeObserverDelegates } from '@verakoubova/stimulus'
import { Controller } from '@stimulus/core'
import { AttributeObserverDelegate } from '@stimulus/mutation-observers'
import { queueSetInPagePosition } from './position'
import { positions } from './positions'

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

    const observeIntersection: AttributeObserverDelegate = {
      elementMatchedAttribute: el => this.intersector.observe(el),
      elementUnmatchedAttribute: el => this.intersector.unobserve(el),
    }

    const updatePositions: AttributeObserverDelegate = {
      elementMatchedAttribute: element => positions.dispatch({ type: 'add', element }),
      elementUnmatchedAttribute: element => positions.dispatch({ type: 'remove', element })
    }

    const delegate = combineAttributeObserverDelegates(
      observeIntersection,
      updatePositions,
    )

    makeAttributeObserver(this, 'data-navigation-top', delegate)
    makeAttributeObserver(this, 'id', delegate)

    this.intersector.observe(topElement)
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
