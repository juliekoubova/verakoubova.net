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

const filters = {
  lang(value) {
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
  },

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

    const items = withSameValue(this.ctx.id ? 'id' : 'layout')

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
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension('yaml', text => yaml.safeLoad(text))
  eleventyConfig.addPassthroughCopy("img")
  for (const [key, fn] of Object.entries(filters)) {
    eleventyConfig.addFilter(key, fn)
  }
}