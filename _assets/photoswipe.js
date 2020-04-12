import { Application, Controller } from 'stimulus'
import Photoswipe from 'photoswipe'
import PhotoswipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'
import './photoswipe.css'

class GalleryController extends Controller {
  open(e) {
    const items = JSON.parse(this.data.get('items'))
    if (!items || !items.length) {
      return
    }
    const el = document.querySelector('.pswp')
    this.pswp = new Photoswipe(el, PhotoswipeUI_Default, items, {
      galleryUID: this.data.get('uid'),
      index: 0,
    })
    this.pswp.init()
    e.preventDefault()
  }
}

if (!window.vekApp) {
  window.vekApp = Application.start()
}

window.vekApp.register('gallery', GalleryController)

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = '/photoswipe.css'
document.head.append(link)