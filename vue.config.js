
const webpack = require("webpack");
const path = require("path");
const dayjs = require("dayjs");
const defaultSettings = require("./src/settings.js");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const ScriptSetup = require("unplugin-vue2-script-setup/webpack").default;
// vue.config.js
const { codeInspectorPlugin } = require('code-inspector-plugin');

process.env.VUE_APP_BUILD_DATE_TIME = dayjs().format("YYYY-MM-DD HH:mm:ss");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = defaultSettings.title; // page title

// 代理配置  ************************************** 代理配置
// const host = 'http://devsaas.smxzhcs.cn:30067';  // 开发环境, 结尾无斜杠
const host = "https://presaas.smxzhcs.cn"; // 预生产环境, 结尾无斜杠
// const host = "http://10.165.9.56:30003"; // 预生产环境, 结尾无斜杠

// const host = 'https://saas.smxzhcs.cn'; // 生产环境, 结尾无斜杠
// 代理配置  ************************************** 代理配置

console.log(`请求接口地址 ${host}`);

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  outputDir: "dist",
  assetsDir: "static",
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: 3006,
    open: false,
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: `${host}/cicada-api`,
        // target: `${host}`,
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API]: ""
        },
        ws: true
      },
      [process.env.VUE_APP_REPORT_API_PATH]: {
        // 报表相关
        target: `${host}/cicada-server-report`,
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_REPORT_API_PATH]: ""
        },
        ws: true
      }
    }
  },
  parallel: false,
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        "@": resolve("src"),
        static: resolve("static") // 增加这一行代码
      }
    },
    plugins: [
      ScriptSetup({
        /* options */
      }),
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: [
          "javascript",
          "css",
          "html",
          "typescript",
          "json",
          "java",
          "sql"
        ]
      }),
      new webpack.DefinePlugin({
        "process.env.VUE_APP_CONFIG_HOST": JSON.stringify(host)
      })
    ]
  },
  chainWebpack(config) {
    config.plugin("code-inspector-plugin").use(
      codeInspectorPlugin({
        bundler: "webpack",
        editor: 'code', // 指定 IDE 为 vscode
        injectScript: true
      })
    );
    config.externals({
      // 'monaco-editor': 'monaco-editor',
      echarts: "echarts"
    });
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin("preload").tap(() => [
      {
        rel: "preload",
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: "initial"
      }
    ]);

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete("prefetch");

    // set svg-sprite-loader
    config.module
      .rule("svg")
      .exclude.add(resolve("src/icons"))
      .end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      })
      .end();

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === "development", config =>
        config.devtool("cheap-source-map")
      );

    config.when(process.env.NODE_ENV !== "development", config => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end();
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial" // only package third parties that are initially dependent
          },
          elementUI: {
            name: "chunk-elementUI", // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });
      config.optimization.runtimeChunk("single");
    });
  }
};
