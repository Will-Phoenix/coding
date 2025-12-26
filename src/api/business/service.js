import request from '@/utils/request'

// 展示企业购买服务详情-实施后台接口-宁胜珑
export function getEntServiceDetail() {
  return request({
    url: '/api/cicada/productEntCase/entServiceDetail',
    method: 'get',
  })
}

export function getProductEntCaseList() {
  return request({
    url: '/api/cicada/productEntCase/statistic',
    method: 'get',
  })
}

// 企业PC端-服务购买-商品列表接口-张一帆
export function getProductEntOrderList() {
  return request({
    url: '/api/cicada/productEntOrder/productList',
    method: 'get',
  })
}

// /api/cicada/productEntOrder/contractPreview
// 企业PC端-服务购买-合同预览接口-张一帆
export function getContractPreview(data) {
  return request({
    url: '/api/cicada/productEntOrder/contractPreview',
    method: 'get',
    data
  })
}

// /api/cicada/productEntOrder/order
// 企业PC端-服务购买-提交订单接口-张一帆
export function postProductEntOrder(data) {
  return request({
    url: '/api/cicada/productEntOrder/order',
    method: 'post',
    data
  })
}

// /api/cicada/productEntOrder/orderDetail
// 企业PC端-服务购买-订单详情接口-张一帆
export function getOrderDetail(data) {
  return request({
    url: '/api/cicada/productEntOrder/orderDetail',
    method: 'get',
    data
  })
}

// /api/cicada/productEntOrder/uploadTransferRecord
// 企业PC端-服务购买-上传转账记录接口-张一帆
export function uploadTransferRecord(data) {
  return request({
    url: '/api/cicada/productEntOrder/uploadTransferRecord',
    method: 'post',
    data
  })
}

// /api/cicada/productEntOrder/applicationInvoice
// 企业PC端-服务购买-申请开票接口-张一帆
export function applicationInvoice(data) {
  return request({
    url: '/api/cicada/productEntOrder/applicationInvoice',
    method: 'post',
    data
  })
}

// /api/cicada/productEntOrder/cancel
// 企业PC端-服务购买-取消订单接口-张一帆
export function cancelOrder(data) {
  return request({
    url: '/api/cicada/productEntOrder/cancel',
    method: 'post',
    data
  })
}

// /api/cicada/productEntOrder/pageEntOrder
// 企业PC端-企业订单中心-企业管理后台-宁胜珑
export function pageEntOrder(data) {
  return request({
    url: '/api/cicada/productEntOrder/pageEntOrder',
    method: 'get',
    data
  })
}
