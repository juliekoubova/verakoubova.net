import { makeIntersector, makeAttributeObserver, combineAttributeObserverDelegates } from '@verakoubova/stimulus'
import { Controller } from '@stimulus/core'
import { AttributeObserverDelegate } from '@stimulus/mutation-observers'
import { queueSetInPagePosition } from './position'
import { positions } from './positions'
import { setupScrollAnalytics } from './analytics'

setupScrollAnalytics()

export class NavigationController extends Controller {

  private readonly intersector = makeIntersector(
    this,
    this.intersect.bind(this),
    { threshold: 0.2 }
  )

  initialize() {
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
  }

  intersect(entries: IntersectionObserverEntry[]) {
    const intersecting = entries.filter(e => e.isIntersecting)
    for (const entry of intersecting) {
      const target = entry.target.hasAttribute('data-navigation-top')
        ? undefined
        : entry.target
      queueSetInPagePosition(target)
    }
  }
}
