import { createHash } from 'crypto'
import * as sharp from 'sharp'
import { encode } from 'zbase32'

async function loadMetadata(path: string, image: sharp.Sharp) {
  try {
    const { width, height } = await image.metadata()
    if (!height || !width) {
      throw new Error(`@verakoubova/responsiver: Could not load width and height of '${path}'`)
    }
    return { width, height }
  } catch (e) {
    throw new Error(`@verakoubova/responsiver: Error loading metadata of '${path}': ${e}`)
  }
}

function hashImage(image: sharp.Sharp) {
  return new Promise<string>((resolve, reject) => {
    const raw = image.raw()
    const hash = createHash('sha1')
    raw.on('end', () => {
      hash.end()
      const data: Buffer = hash.read()
      const str = encode(data)
      resolve(str)
    })
    raw.pipe(hash).on('error', reject)
  })
}

export interface ResponsiveImage {
  aspectRatio: number
  hash: string
  height: number
  path: string
  width: number
}

export async function loadSourceImage(path: string): Promise<ResponsiveImage> {
  const image = sharp(path)
  const hash = await hashImage(image)
  const { height, width } = await loadMetadata(path, image)
  const aspectRatio = height / width
  return { aspectRatio, hash, height, path, width }
}
