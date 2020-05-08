import { Controller } from "@stimulus/core";
import { makeIntersector } from "@verakoubova/stimulus";

function styleUpdate() {
  return new Promise<number>(
    resolve => requestAnimationFrame(
      () => requestAnimationFrame(resolve)
    )
  )
}

function transitionEnd(el: HTMLElement) {
  return new Promise<TransitionEvent>(resolve => {
    el.addEventListener(
      'transitionend',
      resolve,
      { once: true }
    )
  })
}

async function withClass(el: HTMLElement, className: string, fn: () => Promise<any>) {
  const classNames = className.split(/\s+/)
  classNames.forEach(c => el.classList.add(c))

  try {
    await fn()
  } finally {
    classNames.forEach(c => el.classList.remove(c))
  }
}

async function enter(el: HTMLElement, animation: string) {
  if (!el.hidden) {
    return
  }

  await withClass(el, `${animation}-enter-active ${animation}-enter`, async () => {
    el.hidden = false
    await styleUpdate()
    el.classList.remove(`${animation}-enter`)
    await withClass(el, `${animation}-enter-to`, () => transitionEnd(el))
  })
}

async function leave(el: HTMLElement, animation: string) {
  if (el.hidden) {
    return
  }

  await withClass(el, `${animation}-leave-active ${animation}-leave`, async () => {
    await styleUpdate()
    el.classList.remove(`${animation}-leave`)
    await withClass(el, `${animation}-leave-to`, async () => {
      await transitionEnd(el)
      el.hidden = true
    })
  })
}

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
      leave(this.fixedHeaderTarget, 'slide-up')
    } else {
      enter(this.fixedHeaderTarget, 'slide-up')
    }
  }
}