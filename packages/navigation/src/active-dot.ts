import { Controller } from "stimulus";
import { InPagePosition, currentPosition } from "./navigation";
import { hashEqual } from "./hash-utils";
import { makeSubscriber } from "@verakoubova/stimulus";

function delayFirstInvocation<T, Args extends any[], F extends (...args: Args) => T>(
  delayMs: number,
  f: F,
) {
  let called = false
  return function delayed(...args: Args): Promise<T> {
    return new Promise<T>(resolve => {
      if (called) {
        resolve(f(...args))
      } else {
        called = true
        setTimeout(() => resolve(f(...args)), delayMs)
      }
    })
  }
}

export class ActiveDotController extends Controller {

  static targets = ["link"]
  readonly linkTargets!: HTMLAnchorElement[]
  first = true

  initialize() {
    this.first = true
    makeSubscriber(
      this,
      () => currentPosition.subscribe(
        delayFirstInvocation(600, pos => this.update(pos))
      )
    )
  }

  private update(pos: InPagePosition) {
    this.linkTargets.forEach(link => {
      const isTarget = hashEqual(pos.id ?? '', link.href)
      if (!this.first) {
        link.style.transition = 'none'
      }
      link.style.opacity = isTarget ? '.75' : '.20'
    })
    this.first = false
  }
}