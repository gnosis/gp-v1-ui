import HtmlWebPackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import DashboardPlugin from 'webpack-dashboard/plugin'
import InlineChunkHtmlPlugin from 'react-dev-utils/InlineChunkHtmlPlugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

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
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
    }),
    new webpack.DefinePlugin({
      'process.env.MOCK': JSON.stringify(process.env.MOCK || 'false'),
    }),
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
  },
})
