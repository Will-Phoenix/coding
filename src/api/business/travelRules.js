import request from '@/utils/request'

// 基础规则-列表 --苏鹏飞
export function getBaseRulesList(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesBaseRules/list',
    method: 'post',
    data
  })
}

// 基础规则-新增 --苏鹏飞
export function saveBaseRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesBaseRules/save',
    method: 'post',
    data
  })
}

// 基础规则-编辑 --苏鹏飞
export function updateBaseRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesBaseRules/update',
    method: 'post',
    data
  })
}

// 基础规则-删除 --苏鹏飞
export function deleteBaseRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesBaseRules/delete',
    method: 'post',
    params: data,
  })
}

// 区域规则-列表 --苏鹏飞
export function getRegionRulesList(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesRules/list',
    method: 'post',
    params: data
  })
}

// 区域规则-新增 --苏鹏飞
export function saveRegionRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesRules/save',
    method: 'post',
    data
  })
}

// 区域规则-编辑 --苏鹏飞
export function updateRegionRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesRules/update',
    method: 'post',
    data
  })
}

// 区域规则-删除 --苏鹏飞
export function deleteRegionRules(data) {
  return request({
    url: '/api/cicada/ccdTravelFeesRules/delete',
    method: 'post',
    params: data,
  })
}

// 初始化差旅标准
export function syncJyjData() {
  return request({
    url: '/api/cicada/ccdTravelFeesRules/syncJyjData',
    method: 'post',
  })
}
