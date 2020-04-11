import { Application, Controller } from 'stimulus'
import Photoswipe from 'photoswipe'

class GalleryController extends Controller {
  connect() {
    let div = document.querySelector('.pswp')
     document.createElement('div')
  }
  new Photoswipe()
}

const application = Application.start()
application.register('gallery', GalleryController)