const { createConfig } = require('@openedx/frontend-build');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Injects stage-specific env vars from .env.development-stage.
 * 
 * Note: ideally, we could use the base config for `webpack-dev-stage` in
 * `getBaseConfig` above, however it appears to have a bug so we have to 
 * manually load the stage-specific env vars ourselves for now.
 * 
 * The .env.development-stage env vars must be loaded before the base
 * config is created.
 */
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development-stage'),
});

const config = createConfig('webpack-dev', {
  devServer: {
    allowedHosts: 'all',
    server: 'https',
  },
});

module.exports = config;
