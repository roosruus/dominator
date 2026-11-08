const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build/dist');
const APP_DIR = path.resolve(__dirname, 'src/webapp');

const config = {
  entry: APP_DIR + '/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: APP_DIR + '/index.html'
    })
  ],
  devServer: {
    static: BUILD_DIR,
    historyApiFallback: true
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

module.exports = config;
