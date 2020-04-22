import { Controller } from 'stimulus'
import { makeSubscriber } from '@verakoubova/stimulus'
import { InPagePosition, currentPosition } from './position'

export class BreadcrumbController extends Controller {

  static readonly targets = ["parentItem", "parentAnchor", "leafItem", "leafHeading"]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentItemTarget!: HTMLElement

  initialize() {
    makeSubscriber(
      this,
      currentPosition,
      this.update
    )
  }

  connect() {
    this.parentAnchorTarget.removeAttribute('href')
    this.parentItemTarget.removeAttribute('hidden')
    this.leafItemTarget.style.opacity = '0'
    requestAnimationFrame(
      () => this.leafItemTarget.style.transition = 'opacity 192ms ease-in'
    )
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