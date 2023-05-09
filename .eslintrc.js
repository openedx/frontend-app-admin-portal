// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');
/* Custom config manipulations */
config.rules = {
  ...config.rules,
  'default-param-last': 'off',

};

config.overrides = [
  {
    files: ['*.test.js', '*.test.jsx'],
    rules: {
      'default-param-last': 'off',
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: [
        "./tsconfig.json",
        "./functions/tsconfig.json",
      ]
    }
  },

];



module.exports = config;
