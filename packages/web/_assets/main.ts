import { BreadcrumbController, NavigationController } from '@verakoubova/navigation'
import { VerticalRhythmController } from '@verakoubova/vertical-rhythm'
import { Application } from 'stimulus'
import { setupHasScrolled, SnapTypeController } from './js'
import '@verakoubova/polyfills'
import './js/turbolinks'

setupHasScrolled()

const vekApp = Application.start()
vekApp.register('breadcrumb', BreadcrumbController)
vekApp.register('navigation', NavigationController)
vekApp.register('snap-type', SnapTypeController)
vekApp.register('vr', VerticalRhythmController)
