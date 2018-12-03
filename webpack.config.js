const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry : [
    './src/js/index.js',
  ],
  output: {
    filename: 'js/main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      {from:'./src/assets',to:'./assets'},
      {from:'./src/index.html', to: './index.html'} 
  ]), 
  ]
};