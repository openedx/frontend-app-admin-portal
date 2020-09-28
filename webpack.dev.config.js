const { getBaseConfig } = require('@edx/frontend-build');
const path = require('path');

const config = getBaseConfig('webpack-dev');
//config.entry.segment = path.resolve(__dirname, './src/segment.js');
config.module.rules.push({
  test: /\.(jpe?g|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/,
  use: [
    'file-loader',
    {
      loader: 'image-webpack-loader',
      options: {
        optimizationlevel: 7,
        mozjpeg: {
          progressive: true,
        },
        gifsicle: {
          interlaced: false,
        },
        pngquant: {
          quality: '65-90',
          speed: 4,
        },
      },
    },
  ],
});

console.log(config)
module.exports = config;
