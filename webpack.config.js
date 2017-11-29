const path = require('path');

const BUILD_DIR = path.resolve(__dirname, 'build/dist');
const APP_DIR = path.resolve(__dirname, 'src/webapp');

const config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.jsx?/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader'
      }
    }]
  }
};

module.exports = config;
