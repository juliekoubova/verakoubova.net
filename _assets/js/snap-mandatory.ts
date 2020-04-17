import { ResizerController } from './resizer'
import { toggleScrollSnapClass } from "./snap"

export class SnapYMandatoryController extends ResizerController {
  resized() {
    const { height } = this.element.getBoundingClientRect()
    const mandatory = height <= innerHeight
    toggleScrollSnapClass('snap-y-mandatory', mandatory)
    toggleScrollSnapClass('snap-y-proximity', !mandatory)
  }
}