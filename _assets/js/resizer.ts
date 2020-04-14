import { Controller } from "stimulus";

export abstract class ResizerController extends Controller {
  private readonly handler = this.resized.bind(this)

  connect() {
    addEventListener('orientationchange', this.handler, { passive: true })
    addEventListener('resize', this.handler, { passive: true })
    this.resized()
  }

  disconnect() {
    removeEventListener('orientationchange', this.handler)
    removeEventListener('resize', this.handler)
  }

  abstract resized(): void
}