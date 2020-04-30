import { promises as fsp } from 'fs'
import { join } from 'path'
import sharp = require("sharp");
import { OriginalImage } from "./original-image";
import { ResizedImage } from "./resized-image";
import { ImageFormats, WebP, ImageFormat } from "./image-formats";
import { fileExists } from "./fs";


async function ensureImageDir(
  outputDir: string,
  original: OriginalImage
) {
  const imageOutputDir = join(outputDir, original.id)
  await fsp.mkdir(imageOutputDir, { recursive: true })
  return imageOutputDir
}

async function writeResizedImage(
  imageDir: string,
  original: OriginalImage,
  physicalWidth: number,
  format: ImageFormat,
): Promise<ResizedImage> {

  const fileName = physicalWidth.toFixed(0) + format.extension
  const path = join(imageDir, fileName)
  const resizedImage: ResizedImage = {
    fileName,
    format,
    original,
    physicalWidth,
  }

  if (await fileExists(path)) {
    return resizedImage
  }

  const resized = sharp(original.path).resize(physicalWidth)
  if (resizedImage.format === WebP) {
    await resized.webp().toFile(path)
  } else {
    await resized.jpeg().toFile(path)
  }

  return resizedImage
}

export type ResizedImageSet = Map<ImageFormat, ResizedImage[]>

export class ResizedImageCache {

  #logicalWidths = new Map<OriginalImage, Set<number>>()

  constructor(
    readonly cacheDir: string,
    readonly outputDir: string,
    readonly pixelDensities: number[]
  ) {
  }

  ensureImages(original: OriginalImage, logicalWidths: number[]) {
    const set = this.#logicalWidths.get(original)
    if (set) {
      for (const w of logicalWidths) {
        set.add(w)
      }
    } else {
      this.#logicalWidths.set(original, new Set(logicalWidths))
    }
  }

  async writeResizedImages() {
    const result = new Map<OriginalImage, ResizedImageSet>()
    for (const [original, logicalWidths] of this.#logicalWidths) {
      const imageDir = await ensureImageDir(this.outputDir, original)
      const physicalWidths = this.getPhysicalWidths(original, logicalWidths)
      const byFormat = await Promise.all(
        ImageFormats.map(format => Promise.all(
          physicalWidths.map(
            physicalWidth => writeResizedImage(
              imageDir,
              original,
              physicalWidth,
              format
            ),
          )
        ).then(images => [format, images] as const))
      )
      result.set(original, new Map(byFormat))
    }
    return result
  }

  private getPhysicalWidths(original: OriginalImage, logicalWidths: Iterable<number>) {
    const physicalWidths = new Set(
      [...logicalWidths]
        .flatMap(lw => this.pixelDensities.map(density => lw * density))
        .filter(pw => pw <= original.physicalWidth)
    )
    physicalWidths.add(original.physicalWidth)
    return [...physicalWidths]
  }
}