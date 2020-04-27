import { createHash } from 'crypto'
import { promises as fsp } from 'fs'
import { join } from 'path'
import * as sharp from 'sharp'
import { encode } from 'zbase32'
import { ScreenDefinition } from './block-model'

export enum Format {
  jpeg = '.jpeg',
  webp = '.webp'
}

async function fileExists(path: string) {
  try {
    await fsp.stat(path)
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}
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

export class ImageWidth {
  constructor(
    readonly logical: number,
    readonly pixelDensity: number,
    readonly targetScreen: ScreenDefinition,
  ) {
  }

  get physical() {
    return this.logical * this.pixelDensity
  }
}

export interface ResizedImage {
  fileName: string
  format: string
  original: OriginalImage
  width: ImageWidth
}

export async function ensureImageDir(
  outputDir: string,
  original: OriginalImage
) {
  const imageOutputDir = join(outputDir, original.id)
  await fsp.mkdir(imageOutputDir, { recursive: true })
}

export async function resizeImage(
  outputDir: string,
  original: OriginalImage,
  width: ImageWidth,
  format: string
): Promise<ResizedImage> {
  const fileName = width.physical.toFixed(0) + format
  const path = join(outputDir, original.id, fileName)
  const result = { fileName, format, original, width }

  if (await fileExists(path)) {
    return result
  }

  const resized = sharp(original.path).resize(width.physical)
  if (format === Format.webp) {
    await resized.webp().toFile(path)
  } else {
    await resized.jpeg().toFile(path)
  }

  return result
}
