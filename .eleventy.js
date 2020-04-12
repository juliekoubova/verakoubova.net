// @ts-check
const yaml = require('js-yaml')

/**
 * @param {object[]} objects
 * @param {string} key
 */
function countBy(objects, key) {
  const counts = new Map()
  for (var obj of objects) {
    if (!obj || typeof obj !== 'object') {
      continue
    }
    const val = obj[key]
    if (counts.has(val)) {
      counts.set(val, counts.get(val) + 1)
    } else {
      counts.set(val, 1)
    }
  }
  return counts
}

/**
 * @param {any[]} objects
 * @param {string} key
 */
function duplicates(objects, key) {
  return [...countBy(objects, key).values()].findIndex(x => x > 1) !== -1
}

function ensureTrailingSlash(url) {
  return String(url).replace(/\/*$/, '/')
}

function lang(value) {
  if (typeof value === 'object' && value) {
    if (this.ctx && this.ctx.lang && this.ctx.lang in value) {
      return value[this.ctx.lang]
    }
    const keys = Object.keys(value).filter(k => k.length === 2)
    if (keys && keys.length !== 0) {
      return value[keys[0]]
    }
  }
  return value
}


const filters = {
  vekNav(page) {
    /**
     * @param {string} key
     * @returns {{ type: 'lang'|'parent', url: string, label: string}[]}
     */
    const withSameValue = (key) => {
      const results = this.ctx.collections.all
        .filter(p => p.data[key] === this.ctx[key])
        .filter(p => p.url !== page.url)
        .filter(p => p.data.lang !== this.ctx.lang)
        .map(p => ({
          type: 'lang',
          url: p.url,
          label: this.ctx.site.languages[p.data.lang]
        }))

      return duplicates(results, 'lang')
        ? []
        : results
    }

    const items = withSameValue(this.ctx.pageId ? 'pageId' : 'layout')

    if (this.ctx.layout !== 'index') {
      items.unshift({
        type: 'parent',
        url: `/${this.ctx.lang}/`,
        label: this.ctx.site.name,
      })
    }

    return items
  },

  stripSortPrefix(value) {
    return String(value).replace(/^\d+-/, '')
  },

  ensureTrailingSlash,

  lang,

  galleryLink(set, key) {

    if(!set || !key)  {
      throw new Error("dict | galleryLink(key)")
    }
    const value = set[key]
    if (!value || !value.images || !value.imageBase) {
      throw new Error(`galleryLink key "${key}" not found between ${Object.keys(set).join(', ')}`)
    }

    const base = ensureTrailingSlash(value.imageBase)
    const slides = value.images.map(image => {
      const relativeSrc = lang(image.src)
      const src = base + relativeSrc
      const metadata = this.ctx.images[src]
      return {
        h: metadata.height,
        w: metadata.width,
        pid: relativeSrc.replace(/^([^.]+)/, '$1'),
        src,
        title: lang(image)
      }
    })

    const { url, slug, escape, safe } = this.env.filters

    const href = url(slug(key))
    const slidesJson = escape(JSON.stringify(slides))

    return safe(`
      <a href="${href}"
         data-controller="gallery"
         data-action="gallery#open"
         data-gallery-items="${slidesJson}"
         data-gallery-uid="${key}"
         >
        ${lang(value)}
      </a>`)
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))

  eleventyConfig.addPassthroughCopy("img")

  for (const [key, fn] of Object.entries(filters)) {
    eleventyConfig.addFilter(key, fn)
  }

  return {
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['html', 'jpeg', 'md', 'njk', 'png', 'yaml'],
  }
}