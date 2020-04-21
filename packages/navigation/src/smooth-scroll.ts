import { Controller } from "stimulus";
import { makeEventHandler } from "@verakoubova/stimulus";
import { getHash } from "./hash-utils";

function isElement(node: EventTarget | null | undefined): node is Element {
  return node &&
    'nodeType' in node &&
    (node as Node).nodeType === Node.ELEMENT_NODE ||
    false
}

function isAnchorElement(node: EventTarget | null | undefined): node is HTMLAnchorElement {
  return isElement(node) && node.tagName === 'A'
}

function getThisDocumentHash(href: string) {
  if (!href) {
    return false
  }

  const { origin, pathname, search } = document.location
  const base = origin + pathname + search

  if (href === base) {
    return '#'
  }
  if (!href.startsWith(base)) {
    return false
  }

  const hash = href.substring(base.length)
  if (hash.length === 0) {
    return '#'
  }

  if (hash.charAt(0) !== '#') {
    return false
  }

  return hash
}

export class SmoothScrollController extends Controller {

  initialize() {
    makeEventHandler(
      this,
      this.element,
      'click',
      e => this.click(e),
    )
  }

  click(e: Event) {
    if (!isAnchorElement(e.target)) {
      return
    }
    const hash = getThisDocumentHash(e.target.href)
    if (!hash) {
      return
    }

    if (hash === '#') {
      scrollTo({ behavior: 'smooth', top: 0 })
      e.preventDefault()
    }

    const id = getHash(hash)
    const element = document.getElementById(id)
    if (!element) {
      return
    }

    element.scrollIntoView({ behavior: 'smooth' })
    e.preventDefault()
  }

}