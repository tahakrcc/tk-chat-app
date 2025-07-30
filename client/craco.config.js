const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "buffer": require.resolve("buffer"),
          "process": require.resolve("process/browser"),
          "stream": require.resolve("stream-browserify"),
          "util": require.resolve("util"),
          "crypto": require.resolve("crypto-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "path": require.resolve("path-browserify"),
          "fs": false,
          "net": false,
          "tls": false
        }
      }
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ]
    }
  }
}; 