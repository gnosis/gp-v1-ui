const HtmlWebPackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const markdownIt = require('markdown-it')
const linkAttributes = require('markdown-it-link-attributes')
const path = require('path')

const dotenv = require('dotenv')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

// Setup env vars
dotenv.config()

const isProduction = process.env.NODE_ENV == 'production'

const baseUrl = isProduction ? '' : '/'
const config = overrideEnvConfig(loadConfig())
const { name: appName } = config

module.exports = ({ stats = false } = {}) => ({
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  output: {
    path: __dirname + '/dist',
    chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    publicPath: baseUrl,
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              disable: !isProduction,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|otf|eot|woff2?)(\?[a-z0-9]+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.md$/,
        use: {
          loader: 'frontmatter-markdown-loader',
          options: {
            mode: ['react-component'],
            markdownIt: markdownIt({
              html: true,
              linkify: true,
              breaks: true,
              xhtmlOut: true,
            }).use(linkAttributes, {
              attrs: {
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            }),
          },
        },
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
    },
    modules: [path.resolve(__dirname, 'custom'), path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js'],
  },
  // drop unused deps
  // https://www.amcharts.com/docs/v4/getting-started/integrations/using-webpack/#Large_file_sizes
  externals: function (context, request, callback) {
    if (/xlsx|canvg|pdfmake/.test(request)) {
      return callback(null, 'commonjs ' + request)
    }
    callback()
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: config.templatePath,
      title: appName,
      ipfsHack: isProduction,
      minify: isProduction && {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new FaviconsWebpackPlugin({
      logo: config.logoPath,
      mode: 'webapp', // optional can be 'webapp' or 'light' - 'webapp' by default
      devMode: 'webapp', // optional can be 'webapp' or 'light' - 'light' by default
      favicons: {
        appName: appName,
        appDescription: appName,
        developerName: appName,
        developerURL: null, // prevent retrieving from the nearest package.json
        background: '#dfe6ef',
        themeColor: '#476481',
        icons: {
          coast: false,
          yandex: false,
        },
      },
    }),
    new PreloadWebpackPlugin({
      rel: 'prefetch',
      include: 'allAssets',
      fileBlacklist: [/\.map/, /runtime~.+\.js$/],
    }),
    isProduction && new InlineChunkHtmlPlugin(HtmlWebPackPlugin, [/runtime/]),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BASE_URL: baseUrl,
      // MOCK: Use mock or real API implementation
      MOCK: 'false',
      MOCK_WALLET: process.env.MOCK || 'false',
      MOCK_TOKEN_LIST: process.env.MOCK || 'false',
      MOCK_ERC20: process.env.MOCK || 'false',
      MOCK_WETH: process.env.MOCK || 'false',
      MOCK_DEPOSIT: process.env.MOCK || 'false',
      MOCK_EXCHANGE: process.env.MOCK || 'false',
      MOCK_WEB3: process.env.MOCK || 'false',
      // AUTOCONNECT: only applies for mock implementation
      AUTOCONNECT: 'true',
      PRICE_ESTIMATOR_URL: process.env.PRICE_ESTIMATOR_URL || (isProduction && 'production') || 'develop',
      APP_ID: null,
      INFURA_ID: null,
      WALLET_CONNECT_BRIDGE: null,
      ETH_NODE_URL: null,
      LIQUIDITY_TOKEN_LIST: null,
    }),
    new ForkTsCheckerWebpackPlugin({ silent: stats }),
    // define inside one plugin instance
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      DEX_JS_VERSION: JSON.stringify(require('@gnosis.pm/dex-js/package.json').version),
      CONTRACT_VERSION: JSON.stringify(require('@gnosis.pm/dex-contracts/package.json').version),
      CONFIG: JSON.stringify(config),
    }),
  ].filter(Boolean),
  optimization: {
    moduleIds: 'hashed',
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxAsyncRequests: 10,
      maxSize: 1000000,
    },
    runtimeChunk: true,
  },
})
