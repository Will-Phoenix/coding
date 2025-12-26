import request from '@/utils/request'

// 出行规则-新增 --苏鹏飞
export function createCcdBizRules(data) {
  return request({
    url: '/api/cicada/ccdBizRules/save',
    method: 'post',
    data
  })
}

// 出行规则-详情 --苏鹏飞
export function getCcdBizRulesDetail(data) {
  return request({
    url: '/api/cicada/ccdBizRules/list',
    method: 'post',
    data
  })
}
