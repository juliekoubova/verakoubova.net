import { EleventyPlugin } from '@11ty/eleventy'
import { minify, Options } from 'html-minifier'
import { isHtml } from './is-html'

export const htmlMinifier: EleventyPlugin<Options> =
  (eleventy, options) => {
    eleventy.addTransform('html-minifier', (content, outputPath) => {
      return isHtml(outputPath)
        ? minify(content, options)
        : content
    })
  }