// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');

const commonConfig = require('./webpack.common.config.js');

// Add process env vars. Currently used only for setting the
// server port and the publicPath
const result = dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

if (result.error) {
  throw result.error;
}

function getLocalAliases() {
  const aliases = {};

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const { localModules } = require(path.resolve(process.cwd(), 'module.config.js'));

    let allPeerDependencies = [];
    const excludedPeerPackages = [];
    localModules.forEach(({ moduleName, dir, dist = '' }) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const { peerDependencies = {}, name } = require(path.resolve(process.cwd(), dir, 'package.json'));
      allPeerDependencies = allPeerDependencies.concat(Object.keys(peerDependencies));
      aliases[moduleName] = path.resolve(process.cwd(), dir, dist);
      excludedPeerPackages.push(name);
    });

    allPeerDependencies = allPeerDependencies.filter((dep) => !excludedPeerPackages.includes(dep));

    allPeerDependencies.forEach((dep) => {
      aliases[dep] = path.resolve(process.cwd(), 'node_modules', dep);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('No local module configuration file found. This is fine.');
  }
  return aliases;
}

const aliases = getLocalAliases();

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: {
    hot: require.resolve('react-dev-utils/webpackHotDevClient'),
    segment: path.resolve(__dirname, '../src/segment.js'),
    app: path.resolve(__dirname, '../src/index.jsx'),
  },

  resolve: {
    alias: aliases,
  },

  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, '../src'),
        ],
        loader: 'babel-loader',
        options: {
          // Caches result of loader to the filesystem. Future builds will attempt to read from the
          // cache to avoid needing to run the expensive recompilation process on each run.
          cacheDirectory: true,
        },
      },
      // We are not extracting CSS from the javascript bundles in development because extracting
      // prevents hot-reloading from working, it increases build time, and we don't care about
      // flash-of-unstyled-content issues in development.
      {
        test: /(.scss|.css)$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
            options: {
              sourceMap: true,
              sassOptions: {
                includePaths: [
                  path.join(__dirname, '../node_modules'),
                  path.join(__dirname, '../src'),
                ],
              },
            },
          },
        ],
      },
      // Webpack, by default, uses the url-loader for images and fonts that are required/included by
      // files it processes, which just base64 encodes them and inlines them in the javascript
      // bundles. This makes the javascript bundles ginormous and defeats caching so we will use the
      // file-loader instead to copy the files directly to the output directory.
      {
        test: /\.(woff2?|ttf|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
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
                quality: [0.65, 0.90],
                speed: 4,
              },
            },
          },
        ],
      },
    ],
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // Generates an HTML file in the output directory.
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(__dirname, '../public/index.html'),
      FAVICON_URL: process.env.FAVICON_URL || null,
    }),
    new Dotenv({
      path: path.resolve(process.cwd(), '.env.development'),
      systemvars: true,
    }),
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
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.
  devServer: {
    host: '0.0.0.0',
    port: 1991,
    historyApiFallback: true,
  },
});
