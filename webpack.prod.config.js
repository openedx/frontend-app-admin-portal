// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');
const webpack = require('webpack');

const config = getBaseConfig('webpack-prod');

const modifiedConfig = {
  ...config,
  plugins: [
    ...config.plugins,
    new webpack.EnvironmentPlugin({
      FEATURE_FLAGS: {
        CODE_MANAGEMENT: true,
        REPORTING_CONFIGURATIONS: true,
        ANALYTICS: false,
        SUPPORT: true,
        SAML_CONFIGURATION: true,
        CODE_VISIBILITY: false,
        EXTERNAL_LMS_CONFIGURATION: true,
      },
    }),
  ],
};

module.exports = modifiedConfig;
