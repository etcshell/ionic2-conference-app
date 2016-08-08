/**
 * @author    Damien Dell'Amico <damien.dellamico@gmail.com>
 * @copyright Copyright (c) 2016
 * @license   GPL-3.0
 */

const path = require('path');
const webpack = require('webpack');
const yargs = require('yargs');
const helpers = require('./webpack.helper');
const pkg = require('./package.json');

/*
 * Webpack Plugins
 */
const validate = require('webpack-validator');
const Joi = require('webpack-validator').Joi;
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

/*
 * Webpack Constants
 */
const paths = {
  www: path.join(__dirname, 'www'),
  src: path.join(__dirname, 'app')
};

console.log('process.env.NODE_ENV ====> ', process.env.NODE_ENV);

const platform = process.env.PLATFORM || 'android';
console.log('platform ====> ', platform);

const themes = {
  ios: 'app.ios.scss',
  android: 'app.md.scss',
  wp: 'app.wp.scss'
};

paths.style = path.join(__dirname, 'app', 'theme', themes[platform]);
console.log('theme path ====> ', paths.style);

/**
 * make Webpack to pick up your vendor dependencies automatically from package.json
 */
const vendors = Object.keys(pkg.dependencies).filter(p => p.indexOf('ionicons') === -1);

const common = {
  entry: {
    app: path.join(paths.src, 'app.ts'),
    style: paths.style
  },
  output: {
    /**
     * The output directory as absolute path (required).
     *
     * See: http://webpack.github.io/docs/configuration.html#output-path
     */
    path: paths.www,
    /**
     * Specifies the name of each output file on disk.
     * IMPORTANT: You must not specify an absolute path here!
     *
     * See: http://webpack.github.io/docs/configuration.html#output-filename
     */
    filename: '[name].js'
  },

  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {
    /*
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['', '.ts', '.js', '.html', '.scss', '.png'],
    // Make sure root is src
    root: [
      paths.src,
      path.join(__dirname, 'node_modules')
    ],
    // remove other default values
    modulesDirectories: [
      'node_modules'
    ]
  },
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, './node_modules/ionic-angular/'),
      path.resolve(__dirname, './node_modules/ionicons/dist/scss/')
    ]
  },

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    /*
     * Plugin: ForkCheckerPlugin
     * Description: Do type checking in a separate process, so webpack don't need to wait.
     *
     * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
     */
    new ForkCheckerPlugin(),

    /**
     * Plugin: DefinePlugin
     * Description: Define free variables.
     * Useful for having development builds with debug logging or adding global constants.
     *
     * Environment helpers
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
     */
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'API_URL': JSON.stringify(process.env.API_URL),
        'CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
        'CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET),
      }
    }),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      template: path.join(paths.src, 'index.html'),
      inject: 'body'
    }),

    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: /^vendor?/
    })
  ],

  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /*
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    loaders: [

      /*
       * Typescript loader support for .ts
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader
       */
      {
        test: /\.ts$/,
        loader: 'awesome-typescript',
        include: paths.src,
        exclude: /(node_modules)/
      },

      /*
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.(png|jpg|svg)$/,
        loader: 'file?name=img/[ext]/[name].[ext]'
      }, {
        test: /\.html$/,
        loader: 'html'
      }, {
        test: [/ionicons\.svg/, /ionicons\.eot/, /ionicons\.ttf/, /ionicons\.woff/, /roboto-bold\.woff/, /roboto-medium\.woff/, /roboto-light\.woff/, /roboto-regular\.woff/, /roboto-bold\.ttf/, /roboto-medium\.ttf/, /roboto-light\.ttf/, /roboto-regular\.ttf/, /noto-sans-bold\.ttf/, /noto-sans-regular\.ttf/],
        loader: 'file?name=fonts/[name].[ext]'
      }
    ],
    noParse: [/.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/, /angular2-polyfills\.js/]
  }
};

console.log('process.env.npm_lifecycle_event ===> ', process.env.npm_lifecycle_event);
let config;
switch (process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(common, {
        output: {
          path: paths.www,

          /**
           * Specifies the name of each output file on disk.
           * IMPORTANT: You must not specify an absolute path here!
           *
           * See: http://webpack.github.io/docs/configuration.html#output-filename
           */
          filename: '[name].[chunkhash].js',

          /** The filename of non-entry chunks as relative path
           * inside the output.path directory.
           *
           * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
           */
          chunkFilename: '[chunkhash].js'
        },
        plugins: [
          // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
          // Only emit files when there are no errors
          new webpack.NoErrorsPlugin(),
          // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
          // Dedupe modules in the output
          new webpack.optimize.DedupePlugin()
        ]
      },
      helpers.clean(paths.www),
      helpers.extractBundle({
        name: 'vendor',
        entries: vendors
      }),
      // helpers.minify(),
      helpers.extractSass(paths.style)
    );
    break;
  default:
    console.log('running default config. npm_lifecycle_event ===> ', process.env.npm_lifecycle_event);
    config = merge(common, {
        devtool: 'eval-source-map',
      },
      helpers.setupSass(paths.style),
      helpers.extractBundle({
        name: 'vendor',
        entries: vendors
      })
    );
    if (helpers.isWebpackDevServer()) {
      config = merge(config, helpers.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      }));
    }
}
// Detect how npm is run and branch based on that

// This joi schema will be `Joi.concat`-ed with the internal schema
// https://github.com/js-dxtools/webpack-validator
const webpackValidatorExtension = Joi.object({
  // this would just allow the property and doesn't perform any additional validation
  sassLoader: Joi.any()
});

module.exports = validate(config, {
  schemaExtension: webpackValidatorExtension,
  quiet: true
});