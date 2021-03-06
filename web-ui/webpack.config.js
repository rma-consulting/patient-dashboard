const webpack = require('webpack');
const path = require('path');
const open = require('open');

const PATHS = {
  src: path.resolve(__dirname, 'client'),
  build: path.resolve(__dirname, 'dist')
};

function OpenPlugin() {
  let firstTime = true;
  OpenPlugin.prototype.apply = (compiler) => {
    compiler.plugin('done', () => {
      if (firstTime) {
        open('http://localhost:8001');
        firstTime = false;
      }
    });
  };
}

module.exports = {
  env: process.env.NODE_ENV,
  entry: {
    app: path.resolve(PATHS.src, 'app.jsx'),
    vendor: ['rxjs', 'react', 'react-dom']
  },

  output: {
    filename: '[name].js',
    path: PATHS.build,
    publicPath: '/assets/'
  },

  cache: true,
  debug: true,
  devtool: 'cheap-module-eval-source-map',

  stats: {
    colors: true,
    reasons: true
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'socket.io-client': path.join(__dirname, 'node_modules', 'socket.io-client', 'socket.io.js')
    }
  },

  module: {
    noParse: [/socket.io-client/],
    preLoaders: [{
      test: /\.(js|jsx)$/,
      include: PATHS.src,
      loader: 'eslint'
    }],
    loaders: [{
      test: /\.(js|jsx)$/,
      include: PATHS.src,
      loader: 'babel'
    }, {
      test: /\.scss/,
      loader: 'style!css!sass?outputStyle=expanded'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|woff|woff2|ttf|svg|eot|gif)$/,
      loader: 'url?limit=8192'
    }]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
    }),
    new OpenPlugin()
  ],

  devServer: {
    contentBase: path.resolve(__dirname, 'client'),
    port: 8001,
    historyApiFallback: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  }

};
