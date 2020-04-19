// @ts-check
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster')
const imagesResponsiver = require('eleventy-plugin-images-responsiver')
const { externalLinks, htmlMinifier } = require('./_plugins')
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

function removeStartingSlash(url) {
  return String(url).replace(/^\//, '')
}

function removeTrailingSlash(url) {
  return String(url).replace(/\/$/, '')
}


function ensureTrailingSlash(url) {
  return String(url).replace(/\/*$/, '/')
}

function pipe(f, g) {
  return (...args) => g(f(...args))
}

const normalizeUrl = pipe(removeStartingSlash, ensureTrailingSlash)

function combineUrl(parent, leaf) {
  return normalizeUrl(parent) + normalizeUrl(leaf)
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

function findPage(ctx, pageId, lang) {
  const filter = lang
    ? (p => p.data.pageId === pageId && p.data.lang === lang)
    : (p => p.data.pageId === pageId)

  const page = ctx.collections.all.find(filter)
  return page
}

function getFilters(self) {
  const result = {}

  for (const key in self.env.filters) {
    result[key] = self.env.filters[key].bind(self)
  }

  return result
}

const filters = {
  vekNav(page) {
    const result = [
      {
        url: `/${this.ctx.lang}/`,
        label: this.ctx.site.name
      }
    ]

    if (this.ctx.parentId) {
      const parent = findPage(this.ctx, this.ctx.parentId, this.ctx.lang)
      if (parent) {
        result.push({
          url: parent.url,
          label: lang(parent.data.title)
        })
      }
    }

    return result
  },

  languages(_page) {
    return Object.entries(this.ctx.site.languages).map(([lang, label]) => {
      const target = this.ctx.pageId
        ? findPage(this.ctx, this.ctx.pageId, lang)
        : undefined

      const url = target ? target.url : `/${lang}/`
      const active = lang === this.ctx.lang

      return { active, label, url }
    })
  },

  stripSortPrefix(value) {
    return String(value).replace(/^\d+-/, '')
  },

  ensureTrailingSlash,

  lang,

  item(url, baseUrl = this.ctx.page.url) {
    if (!url) {
      return ''
    }
    const filePathStem = '/' + removeTrailingSlash(combineUrl(baseUrl, url))
    const item = this.ctx.collections.all.find(p => p.filePathStem === filePathStem)
    return item
  },

  itemData(url, property, baseUrl) {
    const item = this.env.filters.item.call(this, url, baseUrl)
    return item && item.data[property] || undefined
  },

  itemContent(url, baseUrl) {
    const item = this.env.filters.item.call(this, url, baseUrl)
    return item ? item.templateContent : ''
  },

  galleryLink(set, key) {

    if (!set || !key) {
      throw new Error("dict | galleryLink(key)")
    }
    const value = set[key]
    if (!value || !value.images || !value.imageBase) {
      throw new Error(`galleryLink key "${key}" not found between ${Object.keys(set).join(', ')}`)
    }

    const { url, slug, safe } = this.env.filters

    const href = url(slug(key))

    return safe(`<a href="${href}"> ${lang.call(this, value)} </a>`)
  },

  link(path) {
    const { escape, item, url, safe } = getFilters(this)
    const target = item(path)
    const href = escape(ensureTrailingSlash(url(path)))
    const text = target && target.data.title || path
    return safe(`<a href="${href}">${text}</a>`)
  }
}

module.exports = /**
 * @param {import('@11ty/eleventy').Eleventy} eleventyConfig
 */
  function (eleventyConfig) {
    eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))

    eleventyConfig.addPassthroughCopy("img")
    eleventyConfig.addPassthroughCopy("*.mp3")
    eleventyConfig.addPassthroughCopy(".nojekyll")

    eleventyConfig.addPlugin(externalLinks)

    if (process.env.NODE_ENV === 'production') {
      eleventyConfig.addPlugin(cacheBuster({}))
    }

    eleventyConfig.addPlugin(htmlMinifier, {
      caseSensitive: false,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      decodeEntities: true,
      html5: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      sortAttributes: true,
      sortClassName: true
    })

    for (const [key, fn] of Object.entries(filters)) {
      eleventyConfig.addFilter(key, fn)
    }

    // In order to support Turbolinks, Browsersync can be used with a custom rule
    // to include Browsersync's script at the <head> tag instead of the <body> tag.
    // https://github.com/BrowserSync/browser-sync/wiki/Browsersync-for-Turbolinks
    eleventyConfig.setBrowserSyncConfig({
      snippetOptions: {
        rule: {
          match: /<\/head>/i,
          fn: function (snippet, match) {
            return snippet + match;
          }
        }
      }
    })

    return {
      dataTemplateEngine: 'njk',
      markdownTemplateEngine: 'njk',
      htmlTemplateEngine: 'njk',
      templateFormats: ['html', 'jpeg', 'md', 'njk', 'png'],
    }
  }