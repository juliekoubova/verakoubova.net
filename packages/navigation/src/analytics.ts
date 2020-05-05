import { currentPosition } from "./position";

declare global {
  function vekPageView(): void
}

export function setupScrollAnalytics() {
  if (vekPageView) {
    currentPosition.subscribe(() => vekPageView())
  }
}