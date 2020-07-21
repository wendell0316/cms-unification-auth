const webpack = require("webpack");
const express = require("express");
const path = require("path");

let webpackConfig = require("./webpack.dev.config");

module.exports = (app, options) => {
    webpackConfig.entry.main = [
        "webpack-hot-middleware/client",
        webpackConfig.entry.main,
    ];

    let compiler = webpack(webpackConfig);

    let devMiddleware = require("webpack-dev-middleware")(compiler, {
        noInfo: false,
        stats: {
            colors: true,
            chunks: false,
            quiet: false,
        },
    });

    app.use(devMiddleware);
	console.log('******** in ********')
    compiler.plugin("done", () => {
		console.log('******** done ********')
        let fs = devMiddleware.fileSystem;
		let filePath = path.join(webpackConfig.output.path, "index.html");
        if (fs.existsSync(filePath)) {
            let index = fs.readFileSync(filePath, "utf-8");
            options.indexUpdated(index);
		}
    });

    app.use(
        require("webpack-hot-middleware")(compiler, {
            heartbeat: 2000,
            reload: true,
        })
    );
};
