import { Controller } from 'stimulus'
import { wrapController } from './wrapper'

export function makeIntersector(
  controller: Controller,
  delegate: IntersectionObserverCallback,
  options: IntersectionObserverInit = {},
) {
  if (!window.IntersectionObserver) {
    return {
      observe() { },
      unobserve() { }
    }
  }

  let beforeConnectTargets: Element[] = []
  let intersectionObserver: IntersectionObserver | undefined

  wrapController(
    controller,
    () => {
      const observer = new IntersectionObserver(delegate, options)
      beforeConnectTargets.forEach(x => observer.observe(x))
      beforeConnectTargets = []
      intersectionObserver = observer
    },
    () => intersectionObserver?.disconnect()
  )

  return {
    observe(target: Element) {
      if (intersectionObserver) {
        intersectionObserver.observe(target)
      } else {
        beforeConnectTargets.push(target)
      }
    },
    unobserve(target: Element) {
      intersectionObserver?.unobserve(target)
    }
  }
}