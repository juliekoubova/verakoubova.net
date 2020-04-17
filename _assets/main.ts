import { Application } from "stimulus"
import {
  controllers, setupHasScrolled
} from './js'
import './js/polyfills/custom-event'
import './js/turbolinks'

setupHasScrolled()

const vekApp = Application.start()
for (const key in controllers) {
  vekApp.register(key, controllers[key])
}
