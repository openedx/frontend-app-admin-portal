// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');
const path = require('path');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  moduleNameMapper: {
    '^lodash-es$': path.resolve(__dirname, '__mocks__/lodash-es.js'),
  },
});
