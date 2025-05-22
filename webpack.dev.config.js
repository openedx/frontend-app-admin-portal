const {createConfig} = require('@openedx/frontend-build');

const config = createConfig('webpack-dev')

config.module.rules[0].exclude = /node_modules\/(?!(lodash-es|@(open)?edx))/

module.exports = config;
