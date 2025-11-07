const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/silasvitera/',
    clean: true,
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset/resource' },
      { test: /\.(woff2?|ttf|otf|eot)$/i, type: 'asset/resource' },
    ],
  },
  devServer: {
    port: 5173,
    historyApiFallback: { index: '/silasvitera/' },
    proxy: { 
      '/silasvitera/api': { 
        target: 'http://localhost:4000',
        pathRewrite: { '^/silasvitera/api': '/api' },
        changeOrigin: true 
      }
    },
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    new MiniCssExtractPlugin(),
  ],
};
