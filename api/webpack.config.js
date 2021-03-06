const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const WebpackPluginCopy = require('webpack-plugin-copy');
const path = require('path');

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals()],
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new WebpackPluginCopy([{
      copyPermissions: true, // necessary for AWS lambda
      from: 'assets'
    }])
  ]
};