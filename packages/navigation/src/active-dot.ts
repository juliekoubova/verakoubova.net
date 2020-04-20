import { Controller } from "stimulus";
import { InPagePosition, makeNavigationWatcher } from "./navigation";
import { getHash } from "./hash-utils";

export class ActiveDotController extends Controller {

  static targets = ["link"]
  readonly linkTargets!: HTMLAnchorElement[]

  initialize() {
    makeNavigationWatcher(this, pos => this.update(pos))
  }

  private update(pos: InPagePosition) {
    this.linkTargets.forEach(link => {
      const isTarget =
        pos.hash === getHash(link.href) ||
        (pos.hash === '#' && link.hasAttribute('data-navigation-top'))

      link.style.opacity = isTarget ? '.75' : '.20'
    })
  }
}