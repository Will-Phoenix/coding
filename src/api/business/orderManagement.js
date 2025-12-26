import request from '@/utils/request'

// 平台订单中心-实施管理后台-宁胜珑
export function getPageAllOrder(data) {
  return request({
    url: '/api/cicada/productEntOrder/pageAllOrder',
    method: 'get',
    data
  })
}

// 平台订单管理统计-实施后台接口-宁胜珑
export function getOrderStatistic(data) {
  return request({
    url: '/api/cicada/productEntOrder/orderStatistic',
    method: 'get',
    data
  })
}

// 服务名称下拉框-实施后台接口-宁胜珑
export function getProductInfoDropDown() {
  return request({
    url: '/api/cicada/productInfo/nameDropDownBox',
    method: 'get',
  })
}

// 上传正式合同、支付确认、发票上传共用接口-实施后台接口-宁胜珑
export function postUploadAttachments(data) {
  return request({
    url: '/api/cicada/productEntOrder/uploadAttachments',
    method: 'post',
    data
  })
}
