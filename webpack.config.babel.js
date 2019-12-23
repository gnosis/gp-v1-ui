import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import DashboardPlugin from 'webpack-dashboard/plugin'
import InlineChunkHtmlPlugin from 'react-dev-utils/InlineChunkHtmlPlugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import dotenv from 'dotenv'

// Setup env vars
dotenv.config()

const isProduction = process.env.NODE_ENV == 'production'
const baseUrl = '/'

module.exports = ({ stats = false } = {}) => ({
  devtool: 'eval-source-map',
  output: {
    path: __dirname + '/dist',
    chunkFilename: isProduction ? '[name].[chunkhash:4].js' : '[name].js',
    filename: isProduction ? '[name].[chunkhash:4].js' : '[name].js',
    publicPath: baseUrl,
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
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
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    modules: ['src', 'node_modules'],
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/html/index.html',
      title: 'dex-react',
    }),
    isProduction && new InlineChunkHtmlPlugin(HtmlWebPackPlugin, [/runtime/]),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BASE_URL: baseUrl,
    }),
    new ForkTsCheckerWebpackPlugin({ silent: stats }),
    isProduction && new DashboardPlugin(),
    // define inside one plugin instance
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      DEX_JS_VERSION: JSON.stringify(require('@gnosis.pm/dex-js/package.json').version),
      CONTRACT_VERSION: JSON.stringify(require('@gnosis.pm/dex-contracts/package.json').version),

      // MOCK: Use mock or real API implementation
      'process.env.MOCK': JSON.stringify(process.env.MOCK || 'false'),
      'process.env.MOCK_WALLET': JSON.stringify(process.env.MOCK_WALLET || process.env.MOCK || 'false'),
      'process.env.MOCK_TOKEN_LIST': JSON.stringify(process.env.MOCK_TOKEN_LIST || process.env.MOCK || 'false'),
      'process.env.MOCK_ERC20': JSON.stringify(process.env.MOCK_ERC20 || process.env.MOCK || 'false'),
      'process.env.MOCK_DEPOSIT': JSON.stringify(process.env.MOCK_MOCK_DEPOSIT || process.env.MOCK || 'false'),
      'process.env.MOCK_EXCHANGE': JSON.stringify(process.env.MOCK_EXCHANGE || process.env.MOCK || 'false'),

      // AUTOCONNECT: only applies for mock implementation
      'process.env.AUTOCONNECT': JSON.stringify(process.env.AUTOCONNECT || 'true'),
    }),
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
  },
})
