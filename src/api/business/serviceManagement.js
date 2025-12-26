import request from '@/utils/request'

// 实施后台-企业存储管理-分页列表接口-张一帆
export function getEntServicePage(data) {
  return request({
    url: '/api/cicada/productEntCase/page',
    method: 'get',
    data
  })
}

// 实施后台-企业存储管理-统计接口-张一帆
export function getEntServiceStatistic(data) {
  return request({
    url: '/api/cicada/productEntCase/statistic',
    method: 'get',
    data
  })
}

// 实施后台-企业存储管理-增加存储空间，增加使用年限接口-张一帆
export function postAddEntService(data) {
  return request({
    url: '/api/cicada/productEntCase/addCase',
    method: 'post',
    data
  })
}

// 实施后台-企业存储管理-查询企业订单列表-张一帆
export function getEntServiceOrderListByEntId(data) {
  return request({
    url: '/api/cicada/productEntCase/orderList',
    method: 'get',
    data
  })
}
