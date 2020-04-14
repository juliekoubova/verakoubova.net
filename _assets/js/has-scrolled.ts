export function setupHasScrolled() {
  function handler() {
    document.documentElement.classList.toggle(
      'user-has-scrolled',
      scrollY > 10
    )
  }
  window.addEventListener('scroll', handler, { passive: true })
}