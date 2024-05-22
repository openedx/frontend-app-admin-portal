// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@openedx/frontend-build');

const config = getBaseConfig('eslint');
/* Custom config manipulations */
config.rules = {
  ...config.rules,
  '@typescript-eslint/default-param-last': 'off',
  'react/require-default-props': 'off',
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
  {
    files: ['*.test.js', '*.test.jsx'],
    rules: {
      'react/prop-types': 'off',
      'react/jsx-no-constructed-context-values': 'off',
    },
  },
];



module.exports = config;
