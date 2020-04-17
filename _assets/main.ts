import { start as startTurbolinks } from 'turbolinks'
import { vekApp } from './js/vek-app'
import { AdjustVRController } from './js/adjust-vr'
import { setupHasScrolled } from './js/has-scrolled'
import { SnapYMandatoryController } from './js/snap-mandatory'
import { fixSafariScrollSnap } from './js/snap'
import { NavigateOnScrollController } from './js/navigate-on-scroll'

// vekApp.register('can-scroll', CanScrollController)
// vekApp.register('scroll-to', ScrollToController)
vekApp.register('adjust-vr', AdjustVRController)
vekApp.register('navigate-on-scroll', NavigateOnScrollController)
vekApp.register('snap-y-mandatory', SnapYMandatoryController)

fixSafariScrollSnap()
setupHasScrolled()
startTurbolinks()

addEventListener('turbolinks:load', () => {
  const meta = document.querySelector('meta[http-equiv=content-language]')
  const language = meta?.getAttribute('content')
  document.documentElement.setAttribute('lang', language || '')
})
