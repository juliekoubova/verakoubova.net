// @ts-check
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster')
const imagesResponsiver = require('eleventy-plugin-images-responsiver')
const { externalLinks } = require('./_plugins')
const yaml = require('js-yaml')

/**
 * @param {object[]} objects
 * @param {string?} key
 */
function countBy(objects, key) {
  const counts = new Map()
  for (var obj of objects) {
    if (!obj || typeof obj !== 'object') {
      continue
    }
    const val = key ? obj[key] : obj
    if (counts.has(val)) {
      counts.set(val, counts.get(val) + 1)
    } else {
      counts.set(val, 1)
    }
  }
  return counts
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
    return [{
      url: `/${this.ctx.lang}/`,
      label: this.ctx.site.name
    }]
  },

  languages(page) {
    return Object.entries(this.ctx.site.languages).map(([code, label]) => {
      const page = this.ctx.pageId
        ? this.ctx.collections.all.find(
          p => p.data.pageId === this.ctx.pageId && p.data.lang === code
        )
        : undefined

      const url = page ? page.url : `/${code}/`
      const active = code === this.ctx.lang

      return { active, code, label, url }
    })
  },

  stripSortPrefix(value) {
    return String(value).replace(/^\d+-/, '')
  },

  ensureTrailingSlash,

  lang,

  galleryLink(set, key) {

    if (!set || !key) {
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

module.exports = /**
 * @param {import('@11ty/eleventy').Eleventy} eleventyConfig
 */
  function (eleventyConfig) {
    eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))

    eleventyConfig.addPassthroughCopy("img")
    eleventyConfig.addPassthroughCopy(".nojekyll")

    eleventyConfig.addPlugin(externalLinks)

    if (process.env.ELEVENTY_ENV === 'production') {
      eleventyConfig.addPlugin(cacheBuster({}))
    }

    for (const [key, fn] of Object.entries(filters)) {
      eleventyConfig.addFilter(key, fn)
    }

    return {
      dataTemplateEngine: 'njk',
      markdownTemplateEngine: 'njk',
      htmlTemplateEngine: 'njk',
      templateFormats: ['html', 'jpeg', 'md', 'njk', 'png'],
    }
  }