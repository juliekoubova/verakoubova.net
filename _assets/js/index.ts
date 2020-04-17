import * as ctls from './controllers'
import { ControllerConstructor } from 'stimulus'
export { setupHasScrolled } from './has-scrolled'
export { setupTurbolinks } from './turbolinks'

export const controllers: Record<string, ControllerConstructor> = ctls