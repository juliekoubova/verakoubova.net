import { Controller } from "stimulus"
import { InPagePosition, getInPagePosition } from "./navigation"

export class BreadcrumbController extends Controller {

  static readonly targets = ["bodyTitle", "crumb"]

  readonly bodyTitleTarget!: Element
  readonly crumbTargets!: Element[]

  clonedCrumb?: Element
  lastCrumb?: Element
  originalBodyTitle?: string

  connect() {
    this.originalBodyTitle = this.bodyTitleTarget.textContent?.trim()
    this.cloneLastCrumb()
    this.update(getInPagePosition())
  }

  navigated = (e: CustomEvent<InPagePosition>) => {
    this.update(e.detail)
  }

  private cloneLastCrumb() {
    if (this.crumbTargets.length === 0) {
      return
    }

    const last = this.crumbTargets[this.crumbTargets.length - 1]

    if (last.hasAttribute("data-breadcrumb-clone")) {
      this.clonedCrumb = last
      this.lastCrumb = last.previousElementSibling || undefined
      return
    }

    const clone = last.cloneNode(true) as Element
    const cloneA = clone.getElementsByTagName("A")[0] as HTMLAnchorElement

    if (!cloneA) {
      return
    }

    clone.setAttribute("data-breadcrumb-clone", "")
    cloneA.href = '#'
    cloneA.textContent = this.originalBodyTitle || null

    this.lastCrumb = last
    this.clonedCrumb = clone
  }

  private update(pos: InPagePosition) {
    if (pos.id && pos.title) {
      this.toggleClone(true)
      this.bodyTitleTarget.textContent = pos.title
    } else {
      this.toggleClone(false)
      this.bodyTitleTarget.textContent = this.originalBodyTitle || null
    }
  }

  private toggleClone(visible: boolean) {
    if (!this.clonedCrumb || !this.lastCrumb)
      return

    if (visible && !this.clonedCrumb.parentElement) {
      this.lastCrumb.insertAdjacentElement('afterend', this.clonedCrumb)
    } else if (!visible && this.clonedCrumb.parentElement) {
      this.clonedCrumb.remove()
    }
  }

}