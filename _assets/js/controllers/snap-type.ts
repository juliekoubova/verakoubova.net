import { ResizerController } from '../base_controllers'

const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

function toggleScrollSnapClass(className: string, value?: boolean) {
  const el = isSafari ? document.body : document.documentElement
  el.classList.toggle(className, value)
}

export class SnapTypeController extends ResizerController {
  static targets = ["determineBy"]
  readonly hasDetermineByTarget!: boolean
  readonly determineByTarget?: Element

  resized() {
    const target = this.hasDetermineByTarget
      ? this.determineByTarget!
      : this.element
    const { height } = target.getBoundingClientRect()
    const mandatory = this.data.has('mandatory') && height <= innerHeight
    toggleScrollSnapClass('snap-y-mandatory', mandatory)
    toggleScrollSnapClass('snap-y-proximity', !mandatory)
  }
}