export function setupHasScrolled() {
  function handler() {
    window.removeEventListener('scroll', handler)
    document.documentElement.classList.add('user-has-scrolled')
  }
  window.addEventListener('scroll', handler, { once: true, passive: true })
}