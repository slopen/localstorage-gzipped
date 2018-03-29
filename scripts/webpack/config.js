const path = require ('path');
const env = require ('process-env');
const webpack = require ('webpack');
const UglifyJsPlugin = require ('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require ('copy-webpack-plugin');

const projectRoot = path.resolve (__dirname, '../../');
const SRC_PATH = path.resolve (projectRoot, 'src');
const BUILD_PATH = path.resolve (projectRoot, 'build');
const MODULES_PATH = path.resolve (projectRoot, 'node_modules');

const NODE_ENV = env.get ('NODE_ENV') || 'development';
const PRODUCTION = NODE_ENV == 'production';


const config = (filename) => ({

	mode: NODE_ENV,

	entry: [
		path.resolve (SRC_PATH, filename)
	],

	output: {
		filename,
		path: BUILD_PATH,
        library: 'GZLocalStorage',
        libraryTarget: 'var',
        globalObject: 'this'
	},

	performance: {
		hints: false
	},

	resolve: {
		extensions: ['.js'],
		modules: [
			SRC_PATH,
			MODULES_PATH
		]
	},

	module: {
		rules: [
			{
				test: /\.js(x)?$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader'
			}
		]
	},

	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	},

	plugins:
		PRODUCTION ? [
			new UglifyJsPlugin ({
				sourceMap: false,
				uglifyOptions: {
					warnings: false,
					output: {
						comments: false
					},
					compress: {
						conditionals: true,
						dead_code: true,
						evaluate: true,
						loops: true,
						passes: 3,
						booleans: true,
						unused: true,
						join_vars: true,
						collapse_vars: true,
						reduce_vars: true
					},
					mangle: false
				}
			}),
			new webpack.optimize.AggressiveMergingPlugin
		]
	: [
		new CopyWebpackPlugin ([
			{
				from: path.resolve (projectRoot, 'example'),
				to: BUILD_PATH
			}
		])
	],

	stats: {
		children: false
	},

	cache: true,
	devtool: PRODUCTION ? false : 'source-map',

	devServer: {
		port: 8080,
		contentBase: BUILD_PATH,
		historyApiFallback: true,
		disableHostCheck: true,
		stats: 'minimal',
		hot: true,
		inline: true
	}

});

module.exports = [
	config ('index.js'),
	config ('worker.js')
];