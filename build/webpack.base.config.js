const NODE_ENV = process.env.NODE_ENV || "development";
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const projectConfig = require(`../config/${NODE_ENV}`);
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let baseUrl = projectConfig.baseUrl;
let staticUrl = "/dist/";
console.log(`*****${NODE_ENV}********`)
if (
    NODE_ENV == "test" ||
    NODE_ENV === "stage" ||
    NODE_ENV === "stage_test3" ||
    NODE_ENV === "qa" ||
    NODE_ENV === "uat"
) {
    staticUrl = `${baseUrl}dist/`;
} else {
    staticUrl = "./";
}
module.exports = {
    mode: NODE_ENV == "development" ? "development" : "production",
    devtool: NODE_ENV !== "development" ? false : "#cheap-module-source-map",
    entry: {
        main: "./src/main",
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        publicPath: staticUrl,
        filename: "[name].[hash].js",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../src"),
            _c: path.resolve(__dirname, "../src/components"),
            build: path.resolve(__dirname, "../build"),
        },
        extensions: [".js", ".vue"],
    },
    module: {
        noParse: /es6-promise\.js$/, // avoid webpack shimming process
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    compilerOptions: {
                        preserveWhitespace: false,
                    },
                },
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg|mp4|mp3|woff|ttf)$/,
                loader: "url-loader",
                options: {
                    limit: 10240,
                    name: "images/[name].[ext]?[hash]",
                },
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: "file-loader",
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader",
            },
            {
                test: /\.less$/,
                loader:
                    NODE_ENV !== "development"
                        ? ExtractTextPlugin.extract({
                              use: [
                                  {
                                      loader: "css-loader",
                                      options: { minimize: true },
                                  },
                                  "postcss-loader",
                                  "less-loader",
                              ],
                              fallback: "vue-style-loader",
                          })
                        : [
                              "vue-style-loader",
                              "css-loader",
                              "postcss-loader",
                              "less-loader",
                          ],
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    warnings: false,
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: "all",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    priority: 1,
                    enforce: true,
                },
                components: {
                    test: /[\\/]components[\\/]/,
                    name: "components",
                    priority: 2,
                    enforce: true,
                },
                common: {
                    test: /[\\/]common[\\/]|[\\/]services[\\/]/,
                    name: "common",
                    priority: 3,
                    enforce: true,
                },
            },
        },
    },
    performance: {
        maxEntrypointSize: 300000,
        hints: NODE_ENV !== "development" ? "warning" : false,
    },
    plugins:
        NODE_ENV !== "development"
            ? [
				  new webpack.HotModuleReplacementPlugin(),
                  new VueLoaderPlugin(),
                  new ExtractTextPlugin({
                      filename: "common.[hash].css",
                      allChunks: true,
                  }),
                  new HtmlWebpackPlugin({
                      filename: "index.html",
                      template: "./src/template/index.html",
                      inject: true,
                  }),
              ]
            : [
                  new webpack.optimize.ModuleConcatenationPlugin(),
                  new webpack.HotModuleReplacementPlugin(),
                  new VueLoaderPlugin(),
                  new FriendlyErrorsPlugin(),
                  new HtmlWebpackPlugin({
                      filename: "index.html",
                      template: "./src/template/index.html",
                      inject: true,
                  }),
              ]
};
