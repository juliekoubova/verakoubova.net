import { Controller } from 'stimulus'
import { makeSubscriber } from '@verakoubova/stimulus'
import { InPagePosition, currentPosition } from './position'

export class BreadcrumbController extends Controller {

  static readonly targets = [
    'parentItem', 'parentAnchor', 'parentArrow',
    'leafItem', 'leafHeading'
  ]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentArrowTarget!: HTMLAnchorElement
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
    this.parentArrowTarget.setAttribute('hidden', '')
    this.parentItemTarget.removeAttribute('hidden')
    this.leafItemTarget.setAttribute('hidden', '')
    // requestAnimationFrame(
    //   () => this.leafItemTarget.style.transition = 'opacity 192ms ease-in'
    // )
  }

  private update(pos: InPagePosition) {
    if (pos.id && pos.title) {
      this.parentAnchorTarget.href = '#'
      this.parentArrowTarget.removeAttribute('hidden')
      this.leafHeadingTarget.textContent = pos.title
      this.leafItemTarget.removeAttribute('hidden')
    } else {
      this.parentAnchorTarget.removeAttribute('href')
      this.parentArrowTarget.setAttribute('hidden', '')
      this.leafItemTarget.setAttribute('hidden', '')
    }
  }
}