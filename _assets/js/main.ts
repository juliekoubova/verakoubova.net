import { vekApp } from './vek-app'
// import { CanScrollController } from './can-scroll'
// import { ScrollToController } from './scroll-to'
import { setupHasScrolled } from './has-scrolled'
import { fixSafariScrollSnap } from './scoll-snap'
import { AdjustVRController } from './adjust-vr'
import { ScrollSnapMandatoryController } from './scroll-snap-mandatory'

// vekApp.register('can-scroll', CanScrollController)
// vekApp.register('scroll-to', ScrollToController)
vekApp.register('adjust-vr', AdjustVRController)
vekApp.register('scroll-snap-mandatory', ScrollSnapMandatoryController)

fixSafariScrollSnap()
setupHasScrolled()