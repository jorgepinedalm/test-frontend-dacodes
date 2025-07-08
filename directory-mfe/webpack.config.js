const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'directory',
      filename: 'remoteEntry.js',      exposes: {
        './DirectoryApp': './src/bootstrap',
        './UserTable': './src/components/UserTable'
      },      shared: {
        react: { 
          singleton: true, 
          eager: true,
          requiredVersion: '^18.2.0'
        },
        'react-dom': { 
          singleton: true, 
          eager: true,
          requiredVersion: '^18.2.0'
        },
        'react-router-dom': { 
          singleton: true, 
          eager: true,
          requiredVersion: '^6.8.0'
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};
