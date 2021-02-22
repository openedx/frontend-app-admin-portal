// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');
const webpack = require('webpack');

const config = getBaseConfig('webpack-dev');

const modifiedConfig = {
  ...config,
  plugins: [
    ...config.plugins,
    new webpack.EnvironmentPlugin({
      FEATURE_FLAGS: {
        CODE_MANAGEMENT: true,
        REPORTING_CONFIGURATIONS: true,
        ANALYTICS: true,
        SUPPORT: true,
        SAML_CONFIGURATION: true,
        CODE_VISIBILITY: true,
        EXTERNAL_LMS_CONFIGURATION: true,
        BULK_ENROLLMENT: true,
      },
    }),
  ],
};

module.exports = modifiedConfig;
