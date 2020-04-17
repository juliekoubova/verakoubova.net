import { vekApp } from './js/vek-app'
import { AdjustVRController } from './js/adjust-vr'
import { setupHasScrolled } from './js/has-scrolled'
import { SnapYMandatoryController } from './js/snap-mandatory'
import { fixSafariScrollSnap } from './js/snap'

// vekApp.register('can-scroll', CanScrollController)
// vekApp.register('scroll-to', ScrollToController)
vekApp.register('adjust-vr', AdjustVRController)
vekApp.register('snap-y-mandatory', SnapYMandatoryController)

fixSafariScrollSnap()
setupHasScrolled()