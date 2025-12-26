import request from '@/utils/request'

// 企业端-报销单管理列表 ---廖文强
export function getExsOrderList(data) {
  return request({
    url: '/api/cicada/ccdExsOrder/page',
    method: 'post',
    data
  })
}

// 根据用户获取报销单管理列表---张一帆
export function getExsOrderPageByUser(data) {
  return request({
    url: '/api/cicada/ccdExsOrder/pageByUser',
    method: 'post',
    data
  })
}

// 差旅报销单详情 --乔晓东
export function getExsOrderDetail(id) {
  return request({
    url: `/api/cicada/ccdExsOrder/${id}`,
    method: 'get',
  })
}

// 编辑报销单信息 --乔晓东
export function editExsOrder(data) {
  return request({
    url: `/api/cicada/ccdExsOrder/update/${data.id}`,
    method: 'put',
    data,
  })
}

// 根据订单id，批量删除银行付款证明  --乔晓东
export function batchDelBankSlip(data = []) {
  return request({
    url: `/api/cicada/ccdEntBillBankSlip/batchDelBankSlip`,
    method: 'post',
    data
  })
}

// 批量上传银行付款证明，通过ocr识别自动匹配报销单
export function batchUploadBillBankSlip(data) {
  return request({
    url: `/api/cicada/ccdEntBillBankSlip/batchUploadBillBankSlip`,
    method: 'post',
    data,
  })
}

// 提交报销单与银行付款证明对应关系
export function batchRelBankSlip(data) {
  return request({
    url: `/api/cicada/ccdEntBillBankSlip/batchRelBankSlip`,
    method: 'post',
    data,
  })
}

// 编辑记账凭证 --苏鹏飞
export function editVoucherNo(data) {
  return request({
    url: `/api/cicada/ccdFinEntVoucher/addVoucherNo/${data.id}`,
    method: 'put',
    data,
  })
}

// 请款单详情
export function paymentRequestDetail(id) {
  return request({
    url: `/api/cicada/paymentRequest/${id}`,
    method: 'get',
  })
}

// 项目付款申请单详情
export function ccdExsOrderProjectPaymentDetail(id) {
  return request({
    url: `/api/cicada/ccdExsOrderProjectPayment/${id}`,
    method: 'get',
  })
}

// 费用报销单详情
export function ccdExsOrderUnifiedDetail(id) {
  return request({
    url: `/api/cicada/ccdExsOrderUnified/${id}`,
    method: 'get',
  })
}

// 其他申请单详情 --苏鹏飞
export function getOtherOrdersDetail(ids, headers = {}) {
  if (!ids || ids.length === 0) {
    return Promise.resolve({ data: [], code: 200 })
  }
  return request({
    url: "/api/cicada/ccdUnifiedApply/listCompleteOrders",
    method: 'post',
    headers: { ...headers },
    data: {
      idList: ids
    },
  })
}

export function APIGetListCompleteOrdersByType(orderType) {
  return request({
    url: "/api/cicada/ccdUnifiedApply/listCompleteOrders",
    method: 'post',
    data: { type: orderType, idList: [] },
  })
}

// 获取已审核完成的【请款单】列表
export function listForPayment() {
  return request({
    url: "/api/cicada/ccdExsOrder/listForPayment",
    method: 'get'
  })
}

// 申请单信息列表
export function getApplyOrderPageByUser(data) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/page`,
    method: 'post',
    data,
  })
}

// 申请单信息详情
export function getApplyOrder(id) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/${id}`,
    method: 'get',
  })
}

export function deleteApplyOrder(id) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/${id}`,
    method: 'delete',
  })
}

// 修改申请单信息
export function editApplyOrder(data) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/update/${data.id}`,
    method: 'put',
    data,
  })
}

// 删除报销单
export function deleteExsOrder(id) {
  return request({
    url: `/api/cicada/ccdExsOrderMaster/${id}`,
    method: 'delete',
  })
}

// 报销单类型下拉框 ---廖文强
export function aa() {
  return request({
    url: '/api/cicada/CcdEnum/exsOrderTypeSelect',
    method: 'get',
  })
}

// 报销单类型下拉框---最新 ---廖文强
export function orderTypeSelect(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/list',
    method: 'get',
    data,
  })
}

// 生成版式文件  ---廖文强
export function batchSave(data) {
  return request({
    url: '/ccdOrderPanelFileEntity/batchSave',
    method: 'post',
    data,
  })
}

// ---票据详情-数据统计
export function ccdExsOrderTaxStatistic(id) {
  return request({
    url: `/api/cicada/ccdExsOrder/tax/${id}`,
    method: 'get',
  })
}

// 推送归档
export function pushElecArch(data) {
  return request({
    url: `/api/elec/ElecArch/pushElecArch`,
    method: 'post',
    data,
  })
}

// 推送凭证
export function finEntVoucherPush(voucherId) {
  return request({
    url: `/api/cicada/ccdFinEntVoucher/push?id=${voucherId}`,
    method: 'get',
  })
}

// 发票关联报销单
export function postExsOrderRelation(data) {
  return request({
    url: '/api/cicada/ccdExsOrder/relation',
    method: 'post',
    data,
  })
}

export function getOrderList(data) {
  return request({
    url: `/api/cicada/ccdExsOrder/getList`,
    method: 'post',
    data,
  })
}
