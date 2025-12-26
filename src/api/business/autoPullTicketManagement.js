import request from "@/utils/request";

// 管理后台-查询注册诺企企业-乔晓东
export function getRegisterNuoqiPage(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/registerNuoqiPage',
    method: 'get',
    data
  })
}

// 管理后台-企业账套-列表-乔晓东
export function getSobListByEntId(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/listByEntId',
    method: 'get',
    data
  })
}

// 管理后台-虚拟号-列表-乔晓东
export function getVirtualPhoneList(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/virtualPhoneList',
    method: 'get',
    data
  })
}

// 管理后台-注册诺企企业-乔晓东
export function postRegisterNuoqi(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/registerNuoqi',
    method: 'post',
    data
  })
}

// 管理后台-更新诺企状态-乔晓东
export function postUpdateNuoqiStatus(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/updateNuoqiStatus',
    method: 'post',
    data
  })
}
