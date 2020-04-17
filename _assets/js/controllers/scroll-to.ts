import { Controller } from "stimulus"

export class ScrollTo extends Controller {

  static targets = ["list"]

  listTarget!: HTMLElement

  findParentListItem(element: Element) {
    while (element && element.parentElement) {
      if (element.parentElement === this.listTarget) {
        return element
      }
      element = element.parentElement
    }
    return undefined
  }

  scrollTo(toElement: (el: Element) => Element | null) {
    const centerElement = document.elementFromPoint(
      this.listTarget.clientWidth / 2 + this.listTarget.clientLeft,
      this.listTarget.clientHeight / 2 + this.listTarget.clientTop
    )

    if (!centerElement) {
      return
    }

    const centerListItem = this.findParentListItem(centerElement)
    if (!centerListItem) {
      return
    }

    const nextElement = toElement(centerListItem)
    nextElement?.scrollIntoView({ behavior: 'smooth' })
  }

  prev() {
    this.scrollTo(el => el.previousElementSibling)
  }

  next() {
    this.scrollTo(el => el.nextElementSibling)
  }
}

