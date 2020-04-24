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

export interface OriginalImage {
  aspectRatio: number
  id: string
  path: string
  physicalHeight: number
  physicalWidth: number
}

const HashDirLength = 1

export async function loadSourceImage(path: string): Promise<OriginalImage> {
  const image = sharp(path)
  const hash = await hashImage(image)
  const { height, width } = await loadMetadata(path, image)
  const aspectRatio = height / width

  const id =
    hash.substr(0, HashDirLength)
    + '/' +
    hash.substr(HashDirLength)

  return {
    aspectRatio,
    id,
    path,
    physicalHeight: height,
    physicalWidth: width,
  }
}
