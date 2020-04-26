import { cheerioPlugin } from "@verakoubova/plugins"
import { processImageElement } from "./process-image-element"
import { join } from 'path'
import { promises as fsp } from 'fs'


export interface ResponsiverOptions {
  outputDir: string
  urlBase: string
}

export const responsiver = cheerioPlugin<ResponsiverOptions>(
  'responsiver',
  async ($, _outputPath, options = {}) => {
    const { outputDir = '_site', urlBase = '/i' } = options
    const context = {
      $,
      projectDir: process.cwd(),
      outputDir: join(process.cwd(), outputDir, urlBase),
      urlBase
    }
    await fsp.mkdir(context.outputDir, { recursive: true })
    await Promise.all(
      $('img').toArray().map(img => processImageElement(context, img))
    )
  }
)
