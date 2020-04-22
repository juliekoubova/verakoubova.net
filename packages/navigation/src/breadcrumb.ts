import { Controller } from 'stimulus'
import { makeSubscriber } from '@verakoubova/stimulus'
import { InPagePosition, currentPosition } from './position'
import { positions } from './positions'
import { tap, debounceTime, withLatestFrom, switchMap, map, startWith } from 'rxjs/operators'
import { scheduled, asyncScheduler, combineLatest, fromEvent } from 'rxjs'
import { async } from 'rxjs/internal/scheduler/async'

function findIndex(list: InPagePosition[], lookedFor: InPagePosition) {
  return list.findIndex(p => p.id === lookedFor.id)
}

export class BreadcrumbController extends Controller {

  static readonly targets = ["parentItem", "parentAnchor", "leafItem", "leafHeading"]

  readonly leafHeadingTarget!: HTMLElement
  readonly leafItemTarget!: HTMLElement

  readonly parentAnchorTarget!: HTMLAnchorElement
  readonly parentItemTarget!: HTMLElement

  private list?: HTMLOListElement
  private listParent?: HTMLDivElement

  private positions: InPagePosition[] = []
  private listItemHeightPx = 0

  initialize() {

    const positions$ = combineLatest(
      positions,
      fromEvent(window, 'resize').pipe(startWith(undefined)),
      fromEvent(window, 'orientationchange').pipe(startWith(undefined)),
    ).pipe(
      map(([positions]) => positions),
      debounceTime(1, asyncScheduler),
    )

    makeSubscriber(this, positions$, this.updatePositionList)
    makeSubscriber(this, scheduled(currentPosition, asyncScheduler), this.updatePosition)
  }

  connect() {
    this.leafItemTarget.style.display = 'inline-block'
  }

  goUp(e: Event) {
    this.leafItemTarget.style.opacity = '0'
  }

  private updatePosition(pos: InPagePosition) {
    if (!this.list || !this.listParent || !this.positions) {
      return
    }

    const index = findIndex(this.positions, pos)

    if (!pos.id || index === -1) {
      this.parentAnchorTarget.removeAttribute('href')
      this.leafItemTarget.style.opacity = '0'
      return
    }

    const translateY = this.listItemHeightPx * index * -1;
    // console.log({ translateY })
    this.list.style.transform = `translateY(${translateY}px)`
    // this.parentAnchorTarget.href = '#'
    // this.parentItemTarget.removeAttribute('hidden')
    // this.leafItemTarget.style.opacity = '1'
  }

  private updatePositionList(positions: InPagePosition[]) {
    this.positions = positions

    if (!this.listParent || !this.list) {
      this.list = document.createElement('ol')
      this.list.style.position = 'absolute'

      this.listParent = document.createElement('div')
      this.listParent.appendChild(this.list)
      this.leafItemTarget.appendChild(this.listParent)

      this.leafHeadingTarget.classList.add('sr-only')
      // setTimeout(() => this.leafItemTarget.style.transition = 'opacity .2s ease-in, transform .2s ease-in-out')
    }

    this.list.innerHTML = positions
      .map(pos => `<li>${pos.title}</li>`)
      .join('')

    const leafStyle = getComputedStyle(this.leafItemTarget)

    this.listItemHeightPx = parseInt(leafStyle.lineHeight)
    // console.log({ listItemHeightPx: this.listItemHeightPx })

    Object.assign(this.listParent.style, {
      display: 'inline-block',
      height: leafStyle.lineHeight,
      width: this.list.offsetWidth + 'px',
      verticalAlign: 'bottom',
      overflow: 'hidden',
      position: 'relative'
    })
  }
}