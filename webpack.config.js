const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const browserConfig = {
    entry: {
        bundle: path.join(__dirname, 'client/index.js')
    },

    output: {
        path: path.join(__dirname, 'public', 'static'),
        publicPath:  '/',
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [{ loader: 'css-loader' }]
                })
            },

            {
                test: /\.sass$/,
                use: ExtractTextPlugin.extract({
                    use: [{ loader: 'css-loader' }, { loader: 'sass-loader'}]
                })
            },

            {
                test: /(.woff2|.woff|.eot|.ttf|.otf)$/,
                loader: 'file-loader',
                options: {
                    name: "media/[name].[ext]",
                    publicPath: url => url.replace(/public/, "")
                }
            },

            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loaders: 'babel-loader'
            },

            {
                test: /\.(gif|png|jpeg|jpg|svg)$/i,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: "media/[name].[ext]",
                            publicPath: url => url.replace(/public/, "")
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            progressive: true,
                            optimizationLevel: 7,
                            interlaced: false,
                            mozjpeg: {
                                quality: 65
                            },
                            pngquant:{
                                quality: "65-90",
                                speed: 4
                            },
                            svgo:{
                                plugins: [{ removeViewBox: false }, { removeEmptyAttrs: false }]
                            }
                        }
                    }
                ]
            }

        ]
    },

    plugins: [
        new ExtractTextPlugin({
            filename: "css/main.css"
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            'React': 'react',
            "PropTypes":"prop-types"
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
};


const serverConfig = {
    entry: {
        server: path.join(__dirname, 'server/index.js')
    },
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'server.js',
        libraryTarget: "commonjs2"
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: 'css-loader/locals'
            },

            {
                test: /\.sass$/,
                loaders: ['css-loader', 'sass-loader']
            },

            {
                test: /(.woff2|.woff|.eot|.ttf|.otf)$/,
                loader: 'file-loader',
                options: {
                    name: "media/[name].[ext]",
                    publicPath: url => url.replace(/public/, ""),
                    emit: false
                }
            },

            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loaders: 'babel-loader'
            },

            {
                test: /\.(gif|png|jpeg|jpg|svg)$/i,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: "media/[name].[ext]",
                            publicPath: url => url.replace(/public/, ""),
                            emit: false
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            progressive: true,
                            optimizationLevel: 7,
                            interlaced: false,
                            mozjpeg: {
                                quality: 65
                            },
                            pngquant:{
                                quality: "65-90",
                                speed: 4
                            },
                            svgo:{
                                plugins: [{ removeViewBox: false }, { removeEmptyAttrs: false }]
                            }
                        }
                    }
                ]
            }

        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            'React': 'react',
            "PropTypes":"prop-types"
        })
    ]
};

module.exports = [browserConfig, serverConfig];