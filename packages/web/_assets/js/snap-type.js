import { Controller } from 'stimulus'

// yuuuuuuck

const safari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

const isMobileWebkit = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (safari && navigator.maxTouchPoints > 0)


/**
 *
 * @param {string} className
 * @param {boolean} [value]
 */
function toggleScrollSnapClass(className, value) {
  if (isMobileWebkit) {
    // scroll snap is irredeemably broken on iOS. no snap for now :(
      return
  }
  const el = safari ? document.body : document.documentElement
  el.classList.toggle(className, value)
}

export class SnapTypeController extends Controller {
  connect() {
    const mandatory = this.data.has('mandatory')
    toggleScrollSnapClass('snap-y-mandatory', mandatory)
    toggleScrollSnapClass('snap-y-proximity', !mandatory)
  }
}