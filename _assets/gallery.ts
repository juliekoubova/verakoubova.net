import { Application } from 'stimulus'
import { CanScrollController } from './can-scroll'
import { ScrollToController } from './scroll-to'

declare global {
  interface Window {
    vekApp?: Application
  }
}

if (typeof window['vekApp'] !== 'object') {
  window.vekApp = Application.start()
}

window.vekApp.register('can-scroll', CanScrollController)
window.vekApp.register('scroll-to', ScrollToController)

const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

const scrollSnapElement = isSafari
  ? document.body
  : document.documentElement

scrollSnapElement.classList.add('scroll-snap-y-mandatory')