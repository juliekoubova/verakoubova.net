import { ResizerController } from "./resizer";
import { toggleScrollSnapClass } from "./scoll-snap";

export class ScrollSnapMandatoryController extends ResizerController {
  resized() {
    const { height } = this.element.getBoundingClientRect()
    const mandatory = height <= innerHeight
    toggleScrollSnapClass('scroll-snap-y-mandatory', mandatory)
    toggleScrollSnapClass('scroll-snap-y-proximity', !mandatory)
  }
}