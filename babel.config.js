// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const babelConfig = createConfig('babel-typescript', {});

babelConfig.presets[0] = ['@babel/preset-env', { targets: { node: 'current' }, modules: 'auto' }]

module.exports = babelConfig;
