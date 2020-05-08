import { currentPosition } from "./position";

declare global {
  interface Window {
    ga(command: 'send', event: 'pageview'): void
    ga(command: 'set', field: 'location', value: string): void
  }
}

export function setupScrollAnalytics() {
  currentPosition.subscribe(() => {
    const { ga } = window
    ga('set', 'location', location.href)
    ga('send', 'pageview')
  })
}