import {
  ActiveDotController, BreadcrumbController, NavigationController, SmoothScrollController
} from '@verakoubova/navigation'
import { VerticalRhythmController } from '@verakoubova/vertical-rhythm'
import { Application } from 'stimulus'
import { SnapTypeController } from './js'
import '@verakoubova/polyfills'
import './js/turbolinks'

const vekApp = Application.start()
vekApp.register('active-dot', ActiveDotController)
vekApp.register('breadcrumb', BreadcrumbController)
vekApp.register('navigation', NavigationController)
vekApp.register('snap-type', SnapTypeController)
vekApp.register('smooth-scroll', SmoothScrollController)
vekApp.register('vr', VerticalRhythmController)
