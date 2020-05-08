import { Controller } from "@stimulus/core";
import { makeIntersector } from "@verakoubova/stimulus";

export class FixedHeaderController extends Controller {

  static readonly targets = ['fixedHeader', 'staticHeader']

  public readonly fixedHeaderTarget!: HTMLElement
  public readonly staticHeaderTarget!: HTMLElement

  private readonly intersector = makeIntersector(
    this,
    this.update.bind(this),
    { threshold: 1 }
  )

  connect() {
    this.intersector.observe(this.staticHeaderTarget)
  }

  disconnect() {
    this.intersector.unobserve(this.staticHeaderTarget)
  }

  private update(entries: IntersectionObserverEntry[]) {
    const staticHeader = entries.find(e => e.target === this.staticHeaderTarget)
    if (!staticHeader) {
      return
    }

    if (staticHeader.isIntersecting || staticHeader.boundingClientRect.top > 0) {
      this.fixedHeaderTarget.setAttribute('hidden', '')
    } else {
      this.fixedHeaderTarget.removeAttribute('hidden')
    }
  }
}