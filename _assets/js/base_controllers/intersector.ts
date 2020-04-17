import { Controller } from 'stimulus'

export abstract class IntersectorController extends Controller {
  private intersectionObserver?: IntersectionObserver

  threshold?: number[]

  abstract intersect(entries: IntersectionObserverEntry[]): void

  connect() {
    if (!window.IntersectionObserver) {
      return
    }

    this.intersectionObserver = new IntersectionObserver(
      this.intersect.bind(this),
      { threshold: this.threshold }
    )
  }

  disconnect() {
    this.intersectionObserver?.disconnect()
    this.intersectionObserver = undefined
  }

  observe(target: Element) {
    this.intersectionObserver?.observe(target)
  }

  unobserve(target: Element) {
    this.intersectionObserver?.unobserve(target)
  }
}