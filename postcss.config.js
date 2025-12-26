const autoprefixer = require("autoprefixer");
const pxtorem = require("postcss-pxtorem");
const path = require('path');

module.exports = () => ({
  plugins: [
    autoprefixer(),
    pxtorem({
      rootValue({ file }) {
        return file.indexOf("vant") !== -1 ? 37.5 : 75;
      },
      propList: ["*"],
      selectorBlackList: [],
      exclude: (file) => !(file.includes(path.join('src', 'views', 'aiChat')) || file.includes("vant"))
    })
  ]
});
