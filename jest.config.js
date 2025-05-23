// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
});

config.transformIgnorePatterns = ['node_modules/(?!(lodash-es|@(open)?edx)/)'];

module.exports = config;
