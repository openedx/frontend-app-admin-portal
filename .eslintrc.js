// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');
/* Custom config manipulations */
config.rules = {
  ...config.rules,
  'default-param-last': 'off',
  'import/no-named-as-default': 0,
};

config.ignorePatterns = ["*.json", ".eslintrc.js", "*.config.js", "jsdom-with-global.js"];

config.overrides =  [
  {
    files: ['*.test.js', '*.test.jsx'],
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
