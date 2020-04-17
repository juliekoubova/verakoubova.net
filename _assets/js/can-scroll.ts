import { Controller } from 'stimulus'

export class CanScrollController extends Controller {

  static targets = ['up', 'down', 'root']

  downTargets!: HTMLButtonElement[]
  upTargets!: HTMLButtonElement[]
  rootTarget?: HTMLElement

  observer?: IntersectionObserver

  get firstElement() {
    return this.rootTarget?.firstElementChild
  }

  get lastElement() {
    return this.rootTarget?.lastElementChild
  }

  connect() {
    this.scope.
    if (!('IntersectionObserver' in window) || !this.rootTarget) {
      return
    }

    this.observer = new IntersectionObserver(
      this.update.bind(this),
      { root: this.rootTarget }
    )

    this.observe(this.firstElement)
    this.observe(this.lastElement)
  }

  disconnect() {
    this.observer?.disconnect()
    this.observer = undefined
  }

  update(entries: IntersectionObserverEntry[]) {
    entries.forEach(e => {
      if (e.target === this.firstElement) {
        this.updateCanScroll(this.upTargets, !e.isIntersecting)
      } else if (e.target === this.lastElement) {
        this.updateCanScroll(this.downTargets, !e.isIntersecting)
      }
    })
  }

  observe(element: Element | null | undefined) {
    if (element) {
      this.observer?.observe(element)
    }
  }

  updateCanScroll(targets: HTMLButtonElement[], canScroll: boolean) {
    for (const el of targets) {
      el.disabled = !canScroll
    }
  }
}

