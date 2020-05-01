import { OriginalImageCache } from './original-image-cache'
import { ResizedImageCache } from './resized-image-cache'

export interface ResponsiverContext {
  largestViewport: number
  legacyViewport: number
  originalImages: OriginalImageCache
  resizedImages: ResizedImageCache
  urlBase: string
}
