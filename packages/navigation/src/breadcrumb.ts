import { Controller } from 'stimulus'
import { InPagePosition, getInPagePosition, makeNavigationWatcher } from './navigation'

export class BreadcrumbController extends Controller {

  static readonly targets = ["parentItem", "parentAnchor", "leafItem", "leafHeading"]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentItemTarget!: HTMLElement

  initialize() {
    makeNavigationWatcher(this, pos => this.update(pos))
  }

  connect() {
    // hide leaf and show parent
    this.leafItemTarget.style.opacity = '0'
    this.parentItemTarget.removeAttribute('hidden')
    this.update(getInPagePosition())
    setTimeout(() => this.leafItemTarget.style.transition = 'opacity 192ms ease-in')
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