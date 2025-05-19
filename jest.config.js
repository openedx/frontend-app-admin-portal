// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(lodash-es|@(open)?edx)/)',
  ],
});
