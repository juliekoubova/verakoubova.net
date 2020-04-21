import { Controller } from "stimulus";
import { InPagePosition, currentPosition } from "./navigation";
import { getHash, hashEqual } from "./hash-utils";
import { Subscription } from "@verakoubova/store";

export class ActiveDotController extends Controller {

  static targets = ["link"]
  readonly linkTargets!: HTMLAnchorElement[]

  sub?: Subscription

  connect() {
    this.sub = currentPosition.subscribe(pos => this.update(pos))
  }

  disconnect() {
    this.sub?.unsubscribe()
    this.sub = undefined
  }

  private update(pos: InPagePosition) {
    this.linkTargets.forEach(link => {
      const linkHash = link.hasAttribute('data-navigation-top')
        ? ''
        : getHash(link.href)
      const isTarget = hashEqual(pos.id ?? '', linkHash)
      link.style.opacity = isTarget ? '.75' : '.20'
    })
  }
}