import request from '@/utils/request'

// 账套-列表 --廖文强
export function getCcdEntSobList() {
  return request({
    url: '/api/cicada/ccdEntSobEntity/list',
    method: 'get'
  })
}

// 账套-新增 --廖文强
export function ccdEntSobCreate(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/create',
    method: 'post',
    data
  })
}

// 账套-修改 --廖文强
export function ccdEntSobUpdate(data) {
  return request({
    url: '/api/cicada/ccdEntSobEntity/update',
    method: 'post',
    data
  })
}

// 账套-删除 --廖文强
export function ccdEntSobDel(id) {
  return request({
    url: `/api/cicada/ccdEntSobEntity/${id}`,
    method: 'DELETE',
  })
}

// 账套-启用/禁用 --廖文强
export function ccdEntSobEnableOrDisable(data) {
  return request({
    url: `/api/cicada/ccdEntSobEntity/enableOrDisable/${data.id}?status=${data.status}`,
    method: 'post',
    data
  })
}
