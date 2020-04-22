import { makeSubscriber } from '@verakoubova/stimulus';
import { Controller } from 'stimulus';
import { InPagePosition, currentPosition } from './position';
import { hashEqual } from './hash-utils';

function delayFirstInvocation<
  T,
  Context,
  Args extends any[],
  F extends (this: Context, ...args: Args) => T
>(
  delayMs: number,
  f: F,
) {
  let called = false
  return function delayed(this: Context, ...args: Args): Promise<T> {
    return new Promise<T>(resolve => {
      if (called) {
        resolve(f.apply(this, args))
      } else {
        called = true
        setTimeout(() => resolve(f.apply(this, args)), delayMs)
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
      currentPosition,
      delayFirstInvocation(600, this.update),
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