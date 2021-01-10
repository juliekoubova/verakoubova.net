// @ts-nocheck

const plugins = [
  require("postcss-import"),
  require("tailwindcss"),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(require("postcss-preset-env"))
  plugins.push(require("postcss-csso"))
}

module.exports = { plugins }