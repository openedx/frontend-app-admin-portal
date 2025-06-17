// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
});
config.transformIgnorePatterns = ['node_modules/(?!(lodash-es|@(open)?edx)/)'];

// This is temoporary changes to exclude the requests-tab folder from coverage
config.coveragePathIgnorePatterns = [
  '/src/components/learner-credit-management/requests-tab/',
  'src/components/learner-credit-management/BudgetDetailRequestsTabContent.jsx',
];


module.exports = config;
