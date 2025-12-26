import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/api/oauth/Login',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}
// 第三方登录
export function otherLogin(data) {
  return request({
    url: `/api/oauth/render/${data}`,
    method: 'get',

  })
}
// 获取二维码
export function getQrcodeScene() {
  return request({
    url: `/api/cicada/ccdWxQrcodeLoginRecord/getWxQrcodeAndScene`,
    method: 'get',

  })
}
// 查询登录状态
export function getSceneStatus(data) {
  return request({
    url: `/api/oauth/wxQrcodeLogin`,
    method: 'get',
    data
  })
}

// 获取当前用户信息
export function getInfo() {
  return request({
    url: '/api/oauth/CurrentUser',
    method: 'get',
  })
}

// 修改密码信息发送
export function updatePasswordMessage() {
  return request({
    url: '/api/oauth/updatePasswordMessage',
    method: 'Post',
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/api/oauth/Logout',
    method: 'get'
  })
}

// 锁屏解锁登录
export function unlock(data) {
  return request({
    url: '/api/oauth/LockScreen',
    method: 'post',
    data
  })
}

// 获取默认配置
export function getConfig(account) {
  return request({
    url: `/api/oauth/getConfig/${account}`,
    method: 'get'
  })
}
