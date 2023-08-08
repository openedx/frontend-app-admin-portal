const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('webpack-dev', {
  devServer: {
    allowedHosts: 'all',
    https: true,
  },
});