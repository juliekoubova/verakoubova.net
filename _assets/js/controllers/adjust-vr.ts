import { ResizerController } from '../base_controllers'

function adjustToRem(documentFontSizePx: number, px: number) {
  if (px === 0) {
    return ''
  }
  const adjustPx = documentFontSizePx - px
  return `${adjustPx / documentFontSizePx}rem`
}

export class AdjustVR extends ResizerController {
  resized() {
    const el = this.element as HTMLElement
    const { height, top } = el.getBoundingClientRect()
    const { fontSize } = getComputedStyle(document.documentElement)

    const documentFontSizePx = parseFloat(fontSize)
    const topPx = (scrollY + top) % documentFontSizePx
    const bottomPx = (scrollY + height) % documentFontSizePx

    el.style.paddingTop = adjustToRem(documentFontSizePx, topPx)
    el.style.marginBottom = adjustToRem(documentFontSizePx, bottomPx)
  }
}