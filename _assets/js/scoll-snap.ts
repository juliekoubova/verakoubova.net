const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent)

const scrollSnapClass = /^scroll-snap-.+$/

export function fixSafariScrollSnap() {
  if (isSafari) {
    document.documentElement.classList.forEach(className => {
      if (scrollSnapClass.test(className)) {
        document.documentElement.classList.remove(className)
        document.body.classList.add(className)
      }
    })
  }
}

export function toggleScrollSnapClass(className: string, value?: boolean) {
  const el = isSafari ? document.body : document.documentElement
  el.classList.toggle(className, value)
}