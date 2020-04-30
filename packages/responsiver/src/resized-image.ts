import { ImageFormat } from './image-formats'
import { OriginalImage } from "./original-image"

export interface ResizedImage {
  readonly fileName: string
  readonly format: ImageFormat
  readonly original: OriginalImage
  readonly physicalWidth: number
}
