import { Controller } from 'stimulus'
import { InPagePosition, currentPosition } from './navigation'

export class BreadcrumbController extends Controller {

  static readonly targets = ["parentItem", "parentAnchor", "leafItem", "leafHeading"]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentItemTarget!: HTMLElement

  readonly sub = currentPosition.subscribe(pos => this.update(pos))

  connect() {
    // hide leaf and show parent
    this.leafItemTarget.style.opacity = '0'
    this.parentItemTarget.removeAttribute('hidden')
    setTimeout(() => this.leafItemTarget.style.transition = 'opacity 192ms ease-in')
  }

  disconnect() {
    this.sub.unsubscribe()
  }

  goUp(e: Event) {
    this.leafItemTarget.style.opacity = '0'
  }

  private update(pos: InPagePosition) {
    if (pos.id && pos.title) {
      this.parentAnchorTarget.href = '#'
      this.leafHeadingTarget.textContent = pos.title
      this.leafItemTarget.style.opacity = '1'
    } else {
      this.parentAnchorTarget.removeAttribute('href')
      this.leafItemTarget.style.opacity = '0'
    }
  }
}