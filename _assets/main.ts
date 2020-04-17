import {
  controllers, setupHasScrolled, setupTurbolinks
} from './js'
import { Application } from "stimulus"

setupHasScrolled()
setupTurbolinks()

const vekApp = Application.start()
for (const key in controllers) {
  vekApp.register(key, controllers[key])
}
