import { createHash } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { cheerioPlugin } from "./cheerio-plugin";

function tryReadLines(path: string, encoding: 'utf8') {
  try {
    const text = readFileSync(path, encoding)
    return text.split(/\r\n|\n/g)
  } catch (e) {
    return []
  }
}

export const cspInlineHashes = cheerioPlugin('csp-inline-hashes', function ($) {
  const cachePath = resolve(this.outputDir, '.csp-inline-hashes')
  const sources = new Set(tryReadLines(cachePath, 'utf8'))
  const algorithm = 'sha256'

  $('script:not([src]), style').each((_i, el) => {
    const $el = $(el)
    const text = $el.html() ?? ''
    if (!text.length) {
      return
    }

    const hash = createHash(algorithm).update(text).digest('base64')
    if ($el.is('script')) {
      sources.add(`script-src '${algorithm}-${hash}'`)
    } else if ($el.is('style')) {
      sources.add(`style-src '${algorithm}-${hash}'`)
    }
  })

  const sorted = [...sources]
    .filter(Boolean)
    .sort()

  writeFileSync(cachePath, sorted.join('\n'), 'utf8')
})