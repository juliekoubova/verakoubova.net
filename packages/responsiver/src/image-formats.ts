export interface ImageFormat {
  readonly extension: string
  readonly mimeType: string
}

export const JPEG: ImageFormat = {
  extension: '.jpeg',
  mimeType: 'image/jpeg'
}

export const WebP: ImageFormat = {
  extension: '.webp',
  mimeType: 'image/webp'
}

export const ImageFormats: ImageFormat[] = [JPEG, WebP]
