module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: {
        version: 3,
        proposals: true,
      },
      targets: {
        browsers: ['last 2 versions', 'ie 11'],
      },
    }],
    '@babel/preset-react',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: {
        version: 3,
        proposals: true,
      },
      version: '^7.9.2',
    }],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    'emotion',
  ],
};
