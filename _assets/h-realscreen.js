function getWindowHeight() {
  return (
    (document &&
      document.documentElement &&
      document.documentElement.clientHeight) ||
    window.innerHeight
  )
}

const style = document.createElement('style')
function onResize() {
  style.textContent = `.h-realscreen { height: ${getWindowHeight()}px; }`
}

onResize()
document.head.appendChild(style)
window.addEventListener('resize', onResize, { passive: true })
