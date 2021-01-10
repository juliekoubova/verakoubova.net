// @ts-check
'use strict'
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { resolve } = require('path')

const absolute = resolve.bind(undefined, __dirname)
const assets = absolute.bind(undefined, '_assets')
const site = absolute.bind(undefined, '_site')

/** @type {import('webpack').Configuration} */
const config = {
  entry: {
    main: assets('main.js')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  output: {
    path: site()
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ]
}

module.exports = config