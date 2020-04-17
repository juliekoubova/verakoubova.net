import { AttributeObserver } from '@stimulus/mutation-observers'
import { IntersectorController } from '../base_controllers/intersector'

export class NavigateOnScroll extends IntersectorController {

  private attributeObserver?: AttributeObserver

  threshold = [0.1]

  intersect(entries: IntersectionObserverEntry[]) {

    function replace(id: string | null, element?: Element) {
      const hash = id
        ? '#' + id
        : location.href.replace(/#.*/, '')
      if (hash !== location.hash) {
        history.replaceState(history.state , '', hash)
      }
    }

    const currentId = location.hash.replace(/^#/, '')

    for (const entry of entries) {
      const entryId = entry.target.getAttribute('id')
      if (entry.isIntersecting) {
        replace(entryId, entry.target)
        return
      }
      if (entryId === currentId && !entry.isIntersecting) {
        replace(null)
      }
    }
  }

  connect() {
    super.connect()
    this.attributeObserver = new AttributeObserver(this.element, 'id', {
      elementMatchedAttribute: element => this.observe(element),
      elementUnmatchedAttribute: element => this.unobserve(element),
    })
    this.attributeObserver.start()
  }

  disconnect() {
    super.disconnect()
    this.attributeObserver?.stop()
    this.attributeObserver = undefined
  }

}