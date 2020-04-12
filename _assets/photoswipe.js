import { Application, Controller } from 'stimulus'
import Photoswipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'

class GalleryController extends Controller {
  open(e) {
    const items = JSON.parse(this.data.get('items'))
    if (!items || !items.length) {
      return
    }
    const el = document.querySelector('.pswp')
    this.pswp = new Photoswipe(el, false, items)
    this.pswp.init()
    e.preventDefault()
  }
}

if (!window.vekApp) {
  window.vekApp = Application.start()
}

window.vekApp.register('gallery', GalleryController)
console.log(css)

// const link = document.createElement('link')
// link.type = 'stylesheet'
// document.head.append()