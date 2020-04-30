import { OriginalImageCache } from './original-image-cache'
import { ResizedImageCache } from './resized-image-cache'

export interface ResponsiverContext {
  originalImages: OriginalImageCache
  resizedImages: ResizedImageCache
  urlBase: string
}
