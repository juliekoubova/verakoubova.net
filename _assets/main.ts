import { vekApp } from './js/vek-app'
// import { CanScrollController } from './can-scroll'
// import { ScrollToController } from './scroll-to'
import { setupHasScrolled } from './js/has-scrolled'
import { fixSafariScrollSnap } from './js/scoll-snap'
import { AdjustVRController } from './js/adjust-vr'
import { ScrollSnapMandatoryController } from './js/scroll-snap-mandatory'

// vekApp.register('can-scroll', CanScrollController)
// vekApp.register('scroll-to', ScrollToController)
vekApp.register('adjust-vr', AdjustVRController)
vekApp.register('scroll-snap-mandatory', ScrollSnapMandatoryController)

fixSafariScrollSnap()
setupHasScrolled()