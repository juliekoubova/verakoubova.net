const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const { resolve } = require('path')

const site = resolve(__dirname, '../_site/**/*.html')

const plugins = [
  cssnano({ preset: 'default' }),
  purgecss({
    content: [site],
    extractors: [
      {
        extractor(content) {
          return content.match(/[A-Za-z0-9-_:\/]+/g) || []
        },
        extensions: ['css', 'html', 'js'],
      },
    ],
    whitelistPatterns: [/snap-y-(mandatory|proximity)$/]
  })
]

module.exports = { plugins }
