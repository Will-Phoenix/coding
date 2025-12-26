import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

const jnpf = require('./utils/jnpf').default

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

// import './assets/element/theme/index.css'
import Element from 'element-ui'
import Vant from 'vant';

import 'vxe-table/lib/style.css'
import VXETable from 'vxe-table'

// import './styles/element-variables.scss'
import './assets/scss/common.scss'

import '@/styles/index.scss' // global css
import './assets/scss/theme.scss' // 主题
import './assets/scss/reset.scss' // 放最后,覆盖以上

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './permission' // permission control
import './utils/error-log' // error log
import { message } from './utils/message';

import * as filters from './filters' // global filters
import hevueImgPreview from 'hevue-img-preview';
import 'vant/lib/index.css';

// 自定义按钮权限指令
import permission from "@/directive/permission";
import drawerPlugin from "@/directive/drawerPlugin";
Vue.use(permission)
Vue.use(drawerPlugin)
Vue.use(hevueImgPreview)
Vue.use(VueCompositionAPI)
// eventBus挂载
Vue.prototype.$eventBus = new Vue()

Vue.use(Element, {
  size: jnpf.storageGet('size') || 'small', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(VXETable)
Vue.use(Vant);

// 批量引入组件
import components from './components'
Vue.use(components)

// 添加实例属性
Object.assign(Vue.prototype, {
  define: require('./utils/define'), // 常量
  jnpf, // 公共方法
  formValidate: require('./utils/formValidate').default, // 表单验证
  $message: message
})

// 全局注册过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

const vm = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
export default vm
