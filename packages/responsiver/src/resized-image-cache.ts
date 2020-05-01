import { SingleBar, Presets } from 'cli-progress'
import { promises as fsp } from 'fs'
import { join, relative } from 'path'
import sharp = require("sharp");
import { OriginalImage } from "./original-image";
import { ResizedImage } from "./resized-image";
import { ImageFormats, WebP, ImageFormat } from "./image-formats";
import { fileExists } from "./fs";


async function ensureImageDir(
  baseDir: string,
  original: OriginalImage
) {
  const imageOutputDir = join(baseDir, original.id)
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
  const result = {
    fileName,
    format,
    original,
    physicalWidth,
  }

  const existingFileSize = await fileExists(path)
  if (existingFileSize) {
    return { ...result, fileSize: existingFileSize }
  }

  const resized = sharp(original.path).resize(physicalWidth)
  const output = result.format === WebP
    ? await resized.webp().toFile(path)
    : await resized.jpeg().toFile(path)

  return { ...result, fileSize: output.size }
}

async function linkResizedImage(
  cacheImageDir: string,
  outputImageDir: string,
  image: ResizedImage,
) {
  try {
    await fsp.link(
      join(cacheImageDir, image.fileName),
      join(outputImageDir, image.fileName)
    )
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
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

    const physicalWidths = this.getPhysicalWidths()
    const progress = this.startProgress(
      ImageFormats.length *
      [...physicalWidths.values()].reduce(
        (sum, current) => sum + current.length,
        0,
      )
    )
    const result = new Map<OriginalImage, ResizedImageSet>()

    for (const [image, imageWidths] of physicalWidths) {
      const imagePath = relative(process.cwd(), image.path)
      const cacheImageDir = await ensureImageDir(this.cacheDir, image)
      const outputImageDir = await ensureImageDir(this.outputDir, image)

      const byFormat = await Promise.all(
        ImageFormats.map(format => Promise.all(
          imageWidths.map(async physicalWidth => {
            const result = await writeResizedImage(
              cacheImageDir,
              image,
              physicalWidth,
              format
            )
            await linkResizedImage(cacheImageDir, outputImageDir, result)
            progress.increment(1, { imagePath })
            return result
          })
        ).then(images => [format, images] as const))
      )
      result.set(image, new Map(byFormat))
    }

    progress.stop()
    return result
  }

  private startProgress(total: number) {
    const progress = new SingleBar(
      { format: '{bar} {value}/{total} {imagePath}' },
      Presets.rect
    )
    if (total !== 0) {
      progress.start(total, 0, { imagePath: '' })
    }
    return progress
  }

  private getPhysicalWidths() {
    return new Map(
      [...this.#logicalWidths.entries()].map(
        ([original, logicalWidths]) => [
          original,
          this.getImagePhysicalWidths(original, logicalWidths)
        ] as const
      )
    )
  }

  private getImagePhysicalWidths(original: OriginalImage, logicalWidths: Iterable<number>) {
    const physicalWidths = new Set(
      [...logicalWidths]
        .flatMap(lw => this.pixelDensities.map(density => lw * density))
        .map(Math.floor)
        .filter(pw => pw <= original.physicalWidth)
    )
    physicalWidths.add(original.physicalWidth)
    return [...physicalWidths]
  }
}