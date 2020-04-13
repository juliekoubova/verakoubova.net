// import { Application, Controller } from 'stimulus'
import { readFileSync } from 'fs'
import { tns } from 'tiny-slider/src/tiny-slider'
// import Glide from '@glidejs/glide'
// import '@glidejs/glide/dist/css/glide.core.min.css'

// class GlideController extends Controller {
//   open(e) {
//     const items = JSON.parse(this.data.get('items'))
//     if (!items || !items.length) {
//       return
//     }
//     const el = document.querySelector('.pswp')
//     this.pswp = new Photoswipe(el, PhotoswipeUI_Default, items, {
//       galleryUID: this.data.get('uid'),
//       index: 0,
//     })
//     this.pswp.init()
//     e.preventDefault()
//   }
// }

// if (!window.vekApp) {
//   window.vekApp = Application.start()
// }

// window.vekApp.register('glide', GlideController)


function mountTns() {
  const style = document.createElement('style')
  style.textContent = readFileSync(
    './node_modules/tiny-slider/dist/tiny-slider.css',
    { encoding: 'utf8' }
  )
  document.head.appendChild(style)
  tns({
    container: '.tiny-slider'
  })
}

function setupHRealScreen() {
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
}

mountTns()
setupHRealScreen()
// enableNoBounce()
