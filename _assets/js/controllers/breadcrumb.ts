import { Controller } from "stimulus"
import { InPagePosition, getInPagePosition } from "./navigation"

export class BreadcrumbController extends Controller {

  static readonly targets = ["parentItem", "parentAnchor", "leafItem", "leafHeading"]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentItemTarget!: HTMLElement


  connect() {
    // hide leaf and show parent
    this.parentItemTarget.removeAttribute('hidden')
    this.leafItemTarget.style.opacity = '0'
  }

  navigated = (e: CustomEvent<InPagePosition>) => {
    this.update(e.detail)
  }

  private update(pos: InPagePosition) {
    if (pos.id && pos.title) {
      this.parentAnchorTarget.href = '#'
      this.leafHeadingTarget.textContent = pos.title
      this.leafItemTarget.style.opacity = '1'
    } else {
      this.parentAnchorTarget.href = ''
      this.leafItemTarget.style.opacity = '0'
    }
  }
}