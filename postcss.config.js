const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')

const plugins = [
  autoprefixer,
  tailwindcss('./tailwind.config.js'),
]

module.exports = { plugins }
