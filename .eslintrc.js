// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');

config.rules = {
  ...config.rules,
  'default-param-last': 'off',
};

/* Custom config manipulations */

module.exports = config;
