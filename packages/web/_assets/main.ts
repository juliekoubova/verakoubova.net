import { Application } from "stimulus"
import {
  BreadcrumbController, NavigationController,
  setupHasScrolled, SnapTypeController, VRController,
} from './js'
import '@verakoubova/polyfills'
import './js/turbolinks'

setupHasScrolled()

const vekApp = Application.start()
vekApp.register('breadcrumb', BreadcrumbController)
vekApp.register('navigation', NavigationController)
vekApp.register('snap-type', SnapTypeController)
vekApp.register('vr', VRController)
