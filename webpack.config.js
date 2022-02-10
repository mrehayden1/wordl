const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'none',
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader'
      }],
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: process.env.NODE_ENV !== 'production',
        },
      }]
    }]
  },
  resolve: {
    extensions: ['.ts', '...'],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },
  output: {
    filename: 'bundle.[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles.[chunkhash].css'
    }),
    new VanillaExtractPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.NODE_ENV !== undefined
        ? 'static' : 'disabled',
      openAnalyzer: false
    })
  ]
};
