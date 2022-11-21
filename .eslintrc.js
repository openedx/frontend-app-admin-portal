// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');
/* Custom config manipulations */
config.rules = {
  ...config.rules,
  'default-param-last': 'off',
};

module.exports = config;
