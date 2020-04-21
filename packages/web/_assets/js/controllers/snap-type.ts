import { Controller } from 'stimulus'

const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

function toggleScrollSnapClass(className: string, value?: boolean) {
  const el = isSafari ? document.body : document.documentElement
  el.classList.toggle(className, value)
}

export class SnapTypeController extends Controller {
  connect() {
    const mandatory = this.data.has('mandatory')
    toggleScrollSnapClass('snap-y-mandatory', mandatory)
    toggleScrollSnapClass('snap-y-proximity', !mandatory)
  }
}