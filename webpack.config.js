const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const MinifyPlugin = require("babel-minify-webpack-plugin");

const outputDirectory = 'dist';

function config_func(devMode) {
  const config = {
    entry: './src/client/index.js',
    output: {
      path: path.join(__dirname, outputDirectory),
      //filename: 'bundle.js'
      filename: '[name].[hash].js',
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            'vue-loader',
            'eslint-loader'
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [ 
            'babel-loader', 
            'eslint-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000'
        }
      ]
    },
    devServer: {
      port: 3000,
      open: false,
      proxy: {
        '/api': 'http://localhost:8080',
        '/auth': 'http://localhost:8080',
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true
        }
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new CleanWebpackPlugin([outputDirectory]),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico'
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: devMode ? '[name].css' : '[name].[hash].css',
        chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
      })
    ],
    devtool: devMode ? 'inline-source-map' : 'source-map'
    /*
    optimization: {
      minimizer: [
        new MinifyPlugin({},{}),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
    */
  };

  return config;
}

module.exports = (env, argv) => {
  const devMode = (argv.mode === 'development')
  console.log(`devMode = ${devMode}`)
  return config_func(devMode);
}
