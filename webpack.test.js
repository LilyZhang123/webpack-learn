const webpack = require('webpack');
const path = require('path');
var glob = require("glob")
const vuxLoader = require('vux-loader');

var CleanWebpackPlugin = require('clean-webpack-plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

var htmlMiniConfig =  {
	collapseWhitespace: true,
	removeComments: true
};

var webpackconfig = {
	mode:'none',
	entry: addEntry,
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name]-[hash].js'
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [{
				loader: MiniCssExtractPlugin.loader,
				options: {
					// 图片服务地址
					publicPath: "http://test.com/"
				}
			}, {
				loader: 'css-loader'
			}, {
				loader: 'postcss-loader',
				options: {
					ident: 'postcss',
					plugins: [require("autoprefixer")({
						"browsers": [
							"defaults",
							"not ie < 11",
							"last 2 versions",
							"> 1%",
							"iOS 7",
							"last 3 iOS versions"
						]
					})]
				}
			}]
		}, {
			test: /\.(htm|html)$/i,
			use:[{
				loader:'html-withimg-loader'
			},
			{
				loader:"html-loader"
			}] 
		}, {
			test: /.(png|jpg|jpeg|svg|gif)$/,
			use: [{
				loader: 'url-loader',
				options: {
					limit: 8192,
					name: '[path][name].[ext]',
					// 图片服务地址
					publicPath: "http://test.com/"
				}
			}, {
				loader: 'image-webpack-loader',
				options: {
					mozjpeg: {
						progressive: true,
						quality: 65
					},
					// optipng.enabled: false will disable optipng
					optipng: {
						enabled: false,
					},
					pngquant: {
						quality: '65-90',
						speed: 4
					},
					gifsicle: {
						interlaced: false,
					},
					// the webp option will enable WEBP
					webp: {
						quality: 75
					}
				}
			}, ]
		}, {
			test: /\.vue$/,
			loader: 'vue-loader'
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			include: path.resolve(__dirname, "src"),
			loader: 'babel-loader'
		}, {
			test: /\.less$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: "css-loader"
			}, {
				loader: "less-loader"
			}]
		}, {
			test: /\.exec\.js$/,
			use: ['script-loader']
		}]
	},
	resolve: {
		alias: {
			'vue': 'vue/dist/vue.js',
			'components': path.resolve(__dirname, 'src/components'),
			'assert': path.resolve(__dirname, 'src/assert'),
			'images': path.resolve(__dirname, 'src/images'),
			'pages': path.resolve(__dirname, 'src/pages')
		},
		extensions: ['.js', '.vue', '.json', '.less']
	},
	plugins: [
		// 设置环境变量信息
		new webpack.DefinePlugin({
			PRODUCTION: JSON.stringify(true),
			BROWSER_SUPPORTS_HTML5: true,
			TWO: '1+1',
			'typeof window': JSON.stringify('object'),
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		// new VueLoaderPlugin(),
		new CleanWebpackPlugin('dist'),
		new MiniCssExtractPlugin({
			filename:  '[name].css' ,
			chunkFilename:  '[id].css'
		}),
		new OptimizeCSSAssetsPlugin({}),
	
	]
}

function getEntry() {
	let globPath = 'src/pages/**/**/*.html'
	// (\/|\\\\) 这种写法是为了兼容 windows和 mac系统目录路径的不同写法
	let pathDir = 'src/pages(\/|\\\\)(.*?)(\/|\\\\)html'
	let files = glob.sync(globPath)
	let dirname, entries = []
	for (let i = 0; i < files.length; i++) {
		dirname = path.dirname(files[i])
		entries.push(dirname.replace(new RegExp('^' + pathDir), '$2'))
	}
	return entries
}

function addEntry() {
	let entryObj = {}
	getEntry().forEach(item => {
		console.log("item " + item)
		entryObj[item] = path.resolve(__dirname, item, 'index.js')
		console.log("entries " + path.resolve(__dirname, item, 'index.js'))
	})
	return entryObj
}

getEntry().forEach(pathname => {
	let conf = {
		filename: path.join(pathname) + '/index.html',
		template: 'html-withimg-loader!'+ path.join(__dirname, pathname, 'index.html'),
		minify: htmlMiniConfig,
		chunks: [pathname],
	}

	webpackconfig.plugins.push(new htmlWebpackPlugin(conf))
})

module.exports = webpackconfig
