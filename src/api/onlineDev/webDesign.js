import request from '@/utils/request'
// 获取外链信息
export function getShortLink(id) {
  return request({
    url: `/api/visualdev/ShortLink/${id}`,
    method: 'get'
  })
}
//保存外链信息
export function save(data) {
  return request({
    url: `/api/visualdev/ShortLink`,
    method: 'PUT',
    data
  })
}

// 获取外链信息
export function getConfig(id) {
  return request({
    url: `/api/visualdev/ShortLink/getConfig/${id}`,
    method: 'get'
  })
}

// 获取外链信息
export function checkPwd(data) {
  return request({
    url: `/api/visualdev/ShortLink/checkPwd`,
    method: 'post',
    data
  })
}
// 获取列表表单配置JSON
export function getConfigData(modelId, data) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}/Config`,
    method: 'get',
    data
  })
}
// 添加数据
export function createModel(modelId, data) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}`,
    method: 'POST',
    data
  })
}

// 获取数据详情
export function getDataChange(modelId, id) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}/${id}/DataChange`,
    method: 'GET'
  })
}
