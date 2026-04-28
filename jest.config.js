// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupA11yMatchers.js',
  ],
});
// We exclusively use ES-style imports across the org, but those aren't
// compatible with Jest, so force Jest to transpile any of the
// dependencies we authored (plus lodash-es).
config.transformIgnorePatterns = ['node_modules/(?!(lodash-es|@(open)?edx|@2uinc)/)'];


module.exports = config;
