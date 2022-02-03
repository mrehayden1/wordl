const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'none',
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
      filename: 'styles.css'
    }),
    new VanillaExtractPlugin()
  ]
};
