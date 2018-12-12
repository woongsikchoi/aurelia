// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');

module.exports = function({ prod }) {
  const production = prod === 'false' ? false : !!prod;
  return {
    target: 'node',
    mode: production ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
      path: __dirname + '/dist'
    },
    // devtool: production ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules']
    },
    externals: [
      nodeExternals()
    ],
    devtool: false,
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader', exclude: /node_modules/ },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    },
    // node: {
    //   fs: 'fs',
    // },
    plugins: [
      // new HtmlWebpackPlugin({ template: 'index.ejs' }),
      // new BundleAnalyzerPlugin({
      //   // Can be `server`, `static` or `disabled`.
      //   // In `server` mode analyzer will start HTTP server to show bundle report.
      //   // In `static` mode single HTML file with bundle report will be generated.
      //   // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
      //   analyzerMode: production ? 'static' : 'server',
      //   // Host that will be used in `server` mode to start HTTP server.
      //   analyzerHost: 'localhost',
      //   // Port that will be used in `server` mode to start HTTP server.
      //   analyzerPort: 8888,
      //   // Path to bundle report file that will be generated in `static` mode.
      //   // Relative to bundles output directory.
      //   reportFilename: 'bundle_report.html',
      //   // Module sizes to show in report by default.
      //   // Should be one of `stat`, `parsed` or `gzip`.
      //   // See "Definitions" section for more information.
      //   defaultSizes: 'gzip',
      //   // Automatically open report in default browser
      //   openAnalyzer: true,
      //   // If `true`, Webpack Stats JSON file will be generated in bundles output directory
      //   generateStatsFile: true,
      //   // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
      //   // Relative to bundles output directory.
      //   statsFilename: 'stats.json',
      //   // Options for `stats.toJson()` method.
      //   // For example you can exclude sources of your modules from stats file with `source: false` option.
      //   // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      //   statsOptions: {
      //     source: false
      //   },
      //   // Log level. Can be 'info', 'warn', 'error' or 'silent'.
      //   logLevel: 'info'
      // }),
    ]
  }
}
