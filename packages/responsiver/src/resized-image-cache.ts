import { SingleBar, Presets } from 'cli-progress'
import { promises as fsp } from 'fs'
import { join, relative } from 'path'
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
    const progress = this.startProgress()
    const result = new Map<OriginalImage, ResizedImageSet>()

    for (const [original, logicalWidths] of this.#logicalWidths) {
      const originalRelative = relative(process.cwd(), original.path)

      const imageDir = await ensureImageDir(this.outputDir, original)
      const physicalWidths = this.getPhysicalWidths(original, logicalWidths)

      progress.setTotal(
        progress.getTotal() -
        logicalWidths.size +
        physicalWidths.length * ImageFormats.length
      )

      const byFormat = await Promise.all(
        ImageFormats.map(format => Promise.all(
          physicalWidths.map(async physicalWidth => {
            const result = await writeResizedImage(
              imageDir,
              original,
              physicalWidth,
              format
            )
            progress.increment(1, { original: originalRelative })
            return result
          })
        ).then(images => [format, images] as const))
      )
      result.set(original, new Map(byFormat))
    }

    progress.stop()
    return result
  }

  private startProgress() {
    const total = [...this.#logicalWidths.values()].reduce(
      (prev, current) => prev + current.size,
      0
    )
    const progress = new SingleBar(
      { format: '{bar} {value}/{total} {original}' },
      Presets.rect
    )
    if (total !== 0) {
      progress.start(total, 0, { original: '' })
    }
    return progress
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