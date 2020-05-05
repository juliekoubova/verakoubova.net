import { currentPosition } from "./position";

declare global {
  function ga(command: 'send', event: 'pageview'): void
  function ga(command: 'set', field: 'location', value: string): void
}

export function setupScrollAnalytics() {
  currentPosition.subscribe(() => {
    ga('set', 'location', location.href)
    ga('send', 'pageview')
  })
}