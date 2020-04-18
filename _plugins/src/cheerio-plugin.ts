import { EleventyPlugin } from '@11ty/eleventy'
import { load } from 'cheerio'

export function addToken(element: Cheerio, attr: string, token: string) {
  element.attr('rel', (el, i, tokenList) => {
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



export function cheerioPlugin(
  name: string,
  transform: (document: CheerioStatic) => void | Promise<void>
): EleventyPlugin {
  return {
    configFunction(eleventy) {
      eleventy.addTransform(name, async (content, outputPath) => {
        if (typeof outputPath !== 'string') {
          return content
        }

        if (!outputPath.endsWith('.html')) {
          return content
        }

        const document = load(content)
        await Promise.resolve(transform(document))

        const hasBody = /<\s*body(\w|\s|=|"|-)*>/gm
        const html = hasBody.test(content)
          ? document.html()
          : document('body').html()

        return decode(html ?? '')
      })
    }
  }
}