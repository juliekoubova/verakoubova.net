/** @type import('webpack').Configuration */
const config = {
  entry: {
    'main.js': './_assets/main.js',
  },
  output: {
    path: __dirname + '/_site/assets',
    publicPath: '/assets'
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'postcss-loader'] }
    ]
  }
}

module.exports = config