import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

// component: (resolve) => require(["@/views/login/index"], resolve),
export const constantRoutes = [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [{
    path: '/redirect/:path*',
    component: (resolve) => require(['@/views/redirect'], resolve)
  }]
},
{
  path: '/login',
  component: (resolve) => require(['@/views/login'], resolve),
  hidden: true
},
{
  path: '/admin/login',
  component: (resolve) => require(['@/views/login/indexAdmin'], resolve),
  hidden: true
},
{
  path: '/sso',
  component: (resolve) => require(['@/views/login/sso-redirect'], resolve),
  hidden: true
},
{
  path: '/lockScreen',
  component: (resolve) => require(['@/views/basic/lockScreen'], resolve),
  hidden: true
},
{
  path: '/auth-redirect',
  component: (resolve) => require(['@/views/login/auth-redirect'], resolve),
  hidden: true
},
{
  path: '/formShortLink',
  component: (resolve) => require(['@/views/formShortLink'], resolve),
  hidden: true
},
{
  path: '/preview/h5print',
  component: (resolve) => require(['@/views/preview/h5print'], resolve),
  hidden: true
},
{
  path: '/aiChat',
  component: (resolve) => require(['@/views/aiChat/index'], resolve),
  hidden: true,
  meta: { isMobile: true }
},
{
  path: '/oauth/redirect/gtzw',
  component: (resolve) => require(['@/views/oauth/redirect/gtzw'], resolve),
  name: 'OauthRedirectGtzw',
  hidden: true,
  meta: {
    title: '正在授权登录...',
    icon: 'icon-ym icon-ym-generator-kanban',
    affix: false,
    zhTitle: '正在授权登录...'
  }
},
{
  path: '/ddRedirect',
  component: (resolve) => require(['@/views/oauth/redirect/ddRedirect'], resolve),
  name: 'ddRedirect',
  meta: {
    title: 'ddRedirect',
    affix: false,
    zhTitle: '自动登录',
    icon: 'icon-ym icon-ym-codeGeneration',
  }
}
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  base: process.env.VUE_APP_PUBLIC_PATH,
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err && err.name != 'NavigationDuplicated') this.replace('/404')
  })
}

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
