const webpack = require('webpack');
const path = require('path');
const devMode = process.env.NODE_ENV !== 'production'
var glob = require("glob")

var CleanWebpackPlugin = require('clean-webpack-plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

var htmlMiniConfig = devMode ? {
	collapseWhitespace: false,
	removeComments: false
} : {
	collapseWhitespace: true,
	removeComments: true
};



var webpackconfig = {
	entry:addEntry,
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name]-[hash].js'
	},
	devServer: {
		proxy: {
			'/api': {
				'target': 'https://www.imooc.com/',
				'changeOrigin': true,
				'pathRewrite': {
					'^/api': ''
				}
			}
		}
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [{
				loader: MiniCssExtractPlugin.loader,
				options: {
					publicPath: "http://localhost:3000/"
				}
			}, {
				loader: 'css-loader',
				options: {
					sourceMap: true,
					importLoaders: 1
				}
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
			test: /.(png|jpg|jpeg|svg|gif)$/,
			loader: 'file-loader',
			options: {
				name: '[path][name].[ext]',
			}
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			include:path.resolve(__dirname,"src"),
			loader: 'babel-loader',
			options: {
				presets: ["env"]
			}
		}]
	},
	resolve:{
		alias: {
            'vue': 'vue/dist/vue.js'
        }
	},
	plugins: [
	// 设置环境变量信息
	    new webpack.DefinePlugin({
	      PRODUCTION: JSON.stringify(true),
	      VERSION: JSON.stringify('5fa3b9'),
	      BROWSER_SUPPORTS_HTML5: true,
	      TWO: '1+1',
	      'typeof window': JSON.stringify('object'),
	      'process.env': {
	        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
	      }
	    }),
		new CleanWebpackPlugin('dist'),
		new MiniCssExtractPlugin({
			filename: devMode ? '[name].css' : '[name].[hash].css',
			chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
		}),
		new OptimizeCSSAssetsPlugin({})
	]
}

function getEntry () {
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

function addEntry () {
  let entryObj = {}
  getEntry().forEach(item => {
  	console.log("item "+item)
    entryObj[item] = path.resolve(__dirname, item, 'index.js')
    console.log("entries "+path.resolve(__dirname, item, 'index.js'))
  }) 
  return entryObj
}

getEntry().forEach(pathname => {
  let conf = {
    filename: path.join(pathname) + '/index.html',
    template: path.join(__dirname, pathname, 'index.html'),
    minify: htmlMiniConfig,
	chunks: [pathname],
  }
  console.log("filename "+conf.filename)

  webpackconfig.plugins.push(new htmlWebpackPlugin(conf))
})

module.exports = webpackconfig;