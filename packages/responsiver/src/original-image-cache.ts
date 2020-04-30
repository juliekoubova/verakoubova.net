import { createHash } from 'crypto'
import { join } from 'path'
import sharp = require('sharp')
import { encode } from 'zbase32'
import { OriginalImage } from './original-image'
import { fileExists } from './fs'

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

const HashDirLength = 1

async function loadOriginalImage(path: string): Promise<OriginalImage> {

  if (!await fileExists(path)) {
    throw new Error(`File not found: ${path}`)
  }

  const image = sharp(path)
  const hash = await hashImage(image)
  const { height, width } = await loadMetadata(path, image)
  const aspectRatio = height / width

  const id =
    hash.substr(0, HashDirLength) + '/' +
    hash.substr(HashDirLength)

  return {
    aspectRatio,
    id,
    path,
    physicalHeight: height,
    physicalWidth: width,
  }
}

export class OriginalImageCache {

  #cache = new Map<string, Promise<OriginalImage>>()

  constructor(
    readonly projectRoot: string
  ) {
  }

  get(path: string) {
    path = join(this.projectRoot, path)
    const fromCache = this.#cache.get(path)
    if (fromCache) {
      return fromCache
    }
    const result = loadOriginalImage(path)
    this.#cache.set(path, result)
    return result
  }
}