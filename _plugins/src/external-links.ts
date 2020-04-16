import { cheerioPlugin, addToken } from './cheerio-plugin'

export const externalLinks = cheerioPlugin('external-links', $ => {
  $('a[href]').each((_i, link) => {
    const $link = $(link)
    const href = $link.attr('href')?.toLowerCase()

    if (!href || !/^https?:\/\//.test(href)) {
      return
    }

    addToken($link, 'rel', 'noopener')
    $link.attr('target', '_blank')
  })
})

export default externalLinks