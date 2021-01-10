// @ts-check
'use strict'
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { resolve } = require('path')

const absolute = resolve.bind(undefined, __dirname)
const assets = absolute.bind(undefined, '_assets')
const site = absolute.bind(undefined, '_site')


/**
 * @param {import('@babel/preset-env').TargetsOptions} targets
 * @returns {import('@babel/preset-env').Options}
 */
function babelPresetEnvOptions(targets) {
  return {
    corejs: 3,
    modules: false,
    targets,
    useBuiltIns: 'usage',
  }
}

/**
 * @param {string} filename
 * @param {import('@babel/preset-env').TargetsOptions} targets
 * @returns {import('webpack').Configuration}
 */
function createConfig(filename, targets = undefined) {
  return {
    devtool: 'source-map',
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
          enforce: 'pre',
          loader: 'source-map-loader',
        }, {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', babelPresetEnvOptions(targets)]
            ]
          }
        }
      ]
    },
    output: {
      filename,
      path: site(),
    },
    plugins: [
      new MiniCssExtractPlugin(),
    ]
  }
}

module.exports = [
  createConfig('main.js', { esmodules: true })
]