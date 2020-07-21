const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const merge = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.config.js')
module.exports = merge(webpackBaseConfig, {
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].chunk.js'
  },

})
