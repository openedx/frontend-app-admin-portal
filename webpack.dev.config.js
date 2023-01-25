const { getBaseConfig } = require('@edx/frontend-build');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const config = getBaseConfig('webpack-dev');

/* Custom config manipulations */
config.resolve = {
  ...config.resolve,
  fallback: {
    ...config.resolve.fallback,
    fs: false,
  },
};

config.plugins = [
  ...config.plugins,
  new NodePolyfillPlugin(),
];

module.exports = config;
