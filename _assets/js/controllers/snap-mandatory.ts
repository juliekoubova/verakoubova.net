import { ResizerController } from '../base_controllers'

const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

function toggleScrollSnapClass(className: string, value?: boolean) {
  const el = isSafari ? document.body : document.documentElement
  el.classList.toggle(className, value)
}

export class SnapYMandatory extends ResizerController {
  resized() {
    const { height } = this.element.getBoundingClientRect()
    const mandatory = height <= innerHeight
    toggleScrollSnapClass('snap-y-mandatory', mandatory)
    toggleScrollSnapClass('snap-y-proximity', !mandatory)
  }
}