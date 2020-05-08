import { Controller } from "@stimulus/core";
import { makeIntersector } from "@verakoubova/stimulus";

export class FixedHeaderController extends Controller {

  static readonly targets = ['fixedHeader', 'staticHeader']

  public readonly fixedHeaderTarget!: HTMLElement
  public readonly staticHeaderTarget!: HTMLElement

  private readonly intersector = makeIntersector(
    this,
    this.update.bind(this),
    { threshold: 0.5 }
  )

  connect() {
    this.intersector.observe(this.staticHeaderTarget)
  }

  disconnect() {
    this.intersector.unobserve(this.staticHeaderTarget)
  }

  private update(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.intersectionRatio >= 0.5) {
        this.fixedHeaderTarget.setAttribute('hidden', '')
      } else {
        this.fixedHeaderTarget.removeAttribute('hidden')
      }
    }
  }
}