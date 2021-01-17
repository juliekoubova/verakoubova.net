import { EleventyPlugin } from '@11ty/eleventy'
import { load } from 'cheerio'
import { isHtml } from './is-html'

export function addToken(element: cheerio.Cheerio, attr: string, token: string) {
  element.attr(attr, (_el, _i, tokenList) => {
    const tokens = new Set(tokenList?.split(' ') ?? [])
    tokens.add(token)
    return [...tokens].join(' ')
  })
}

// https://github.com/cheeriojs/cheerio/issues/866#issuecomment-482730997
function decode(string: string) {
  return string.replace(/&#x([0-9a-f]{1,6});/ig, (entity, code) => {
    code = parseInt(code, 16);

    // Don't unescape ASCII characters, assuming they're encoded for a good reason
    if (code < 0x80) return entity;

    return String.fromCodePoint(code);
  });
}

export interface CheerioPluginContext {
  outputDir: string
  outputPath: string | false
}

export type CheerioPluginTransform<Options> = (
  this: CheerioPluginContext,
  document: cheerio.Root,
  options: Partial<Options>,
) => void | Promise<void>

export function cheerioPlugin<Options>(
  name: string,
  transform: CheerioPluginTransform<Options>
): EleventyPlugin<Partial<Options>> {
  return function cheerioPlugin(eleventy, options = {}) {
    eleventy.addTransform(name, async function (this: any, content, outputPath) {
      if (!isHtml(outputPath)) {
        return content
      }

      const document = load(content)
      const context = {
        outputDir: this.outputDir,
        outputPath,
      }
      await Promise.resolve(
        transform.call(context, document, options)
      )

      const hasBody = /<\s*body(\w|\s|=|"|-)*>/gm
      const html = hasBody.test(content)
        ? document.html()
        : document('body').html()

      return decode(html ?? '')
    })
  }
}