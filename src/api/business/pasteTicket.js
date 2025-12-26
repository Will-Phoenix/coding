import request from '@/utils/request'

// 票据中心-待贴票/已贴票管理列表 ---廖文强
export function getExsOrderCenterList(data) {
  return request({
    url: '/api/cicada/ccdExsOrderCenter/page',
    method: 'post',
    data
  })
}

// 票据中心-标记为已贴票 ---廖文强
export function flagStickerTicket(id) {
  return request({
    url: `/api/cicada/ccdExsOrderCenter/stickerTicket/${id}`,
    method: 'post',
  })
}

// 批量标记是否贴票 ---乔晓东 status 0 标记成未贴票
export function stickerTicketStatus(data = { ids: [], status: null }) {
  return request({
    url: `/api/cicada/ccdExsOrderCenter/stickerTicketStatus`,
    method: 'post',
    data
  })
}

// 发票详情
export function getInvoiceDetail(id, headers = {}) {
  return request({
    url: `/api/cicada/CcdEntBill/detail/${id}`,
    method: 'get',
    headers: { ...headers },
  })
}

// 发票查验凭证补充接口（发票状态已经变为已查验，但查验凭证没有生成，调用该接口再次生成）
export function CheckVoiceIdentity(id, headers = {}) {
  return request({
    url: `/api/cicada/CcdEntBill/chectFid/${id}`,
    method: 'get',
    headers: { ...headers },
  })
}

// 修改发票信息
export function updateInvoiceInfo(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/updateOcrInfo`,
    method: 'post',
    data,
  })
}

// 发票中心发票列表
export function getBillCenterList(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/page`,
    method: 'post',
    data,
  })
}

// 个人发票列表
export function getCcdBillPage(data) {
  return request({
    url: `/api/cicada/CcdEntBill/page`,
    method: 'post',
    data,
  })
}

// 删除发票
export function deleteBill(id) {
  return request({
    url: `/api/cicada/CcdEntBill/${id}`,
    method: 'delete',
  })
}

// 搜索发票持有人
export function holderUserPage(data) {
  return request({
    url: `/api/permission/Users/holderUserPage`,
    method: 'get',
    data,
  })
}

// 关联持票人
export function setHolder(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/setHolder`,
    method: 'post',
    data,
  })
}

// 批量关联持票人
export function setHolderBatch(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/setHolderBatch`,
    method: 'post',
    data,
  })
}

// 发票验真
export function verification(id) {
  return request({
    url: `/api/cicada/CcdEntBill/verification/${id}`,
    method: 'put',
  })
}

// 人工验证通过
export function checkToSuccess(id) {
  return request({
    url: `/api/cicada/CcdEntBill/audit/${id}`,
    method: 'post',
  })
}

// // 定额发票查验-获取验证码       ----旧的已废弃
// export function getPictureCode() {
//   return request({
//     url: `/api/cicada/CcdEntBill/showPictureCodeWithResult`,
//     method: 'get',
//   })
// }

// 定额发票查验-获取验证码
export function getPictureCode(data) {
  return request({
    url: `/api/cicada/CcdEntBill/showPictureCode.do`,
    method: 'get',
    data,
  })
}

// 批量查询发票代码和号码
export function getBatchInvoiceDetail(data) {
  return request({
    url: `api/cicada/CcdEntBillQuotaInvoice/listByBillIds`,
    method: 'get',
    data,
  })
}

// 一组定额发票ids，获取其连续的收尾发票和不连续的发票
export function getHeadTailByContinuousNumber(continuousNumber) {
  return request({
    url: `/api/cicada/CcdEntBill/getHeadTailByContinuousNumber`,
    method: 'get',
    data: {
      continuousNumber
    }
  })
}

// 定额发票查验-发票验真
export function sspCheck(data) {
  return request({
    url: `/api/cicada/CcdEntBill/sspCheck`,
    method: 'post',
    data,
    meta: {
      allwaysReturnData: true
    }
  })
}

// 电子凭证管理-列表-乔晓东
export function getOrderUsedBillList(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/orderUsedBillList`,
    method: 'post',
    data,
  })
}

// 电子凭证管理-发票类型下拉框---乔晓东
export function getInvoiceTypeList(data) {
  return request({
    url: '/api/cicada/CcdEntBillCenter/invoiceTypeList',
    method: 'get',
    data,
  })
}

// 电子凭证管理-报销单类型下拉框---乔晓东
export function getOrderTypeList(data) {
  return request({
    url: '/api/cicada/CcdEntBillCenter/orderTypeList',
    method: 'get',
    data,
  })
}

// 电子凭证管理-报销单类型下拉框---乔晓东
export function getOrderTypeListV2() {
  return request({
    url: '/api/cicada/CcdEntBillCenter/orderTypeListV2',
    method: 'get',
  })
}

// 人工上传查验凭证
export function reCheckIdentity(data) {
  return request({
    url: '/api/cicada/CcdEntBill/manualCheck',
    method: 'post',
    data,
  })
}

// 企业票池发票列表
export function getEntInvoicePage(data) {
  return request({
    url: `/api/cicada/CcdEntBillCenter/pageEntInvoice`,
    method: 'post',
    data,
  })
}

// 共享发票
export function postShareBill(data) {
  return request({
    url: `/api/cicada/CcdEntBill/shareBill/${data.id}`,
    method: 'post',
    data,
  })
}

// 小程序端和PC端-便捷报销-宁胜珑
export function getMapFastApply() {
  return request({
    url: `/api/cicada/CcdEntBill/mapFastApply`,
    method: 'get',
  })
}

// 小程序端和PC端-忽略接口-宁胜珑
export function postCountByFastApply(data) {
  return request({
    url: `/api/cicada/CcdEntBill/countByFastApply`,
    method: 'post',
    data,
  })
}

// 小程序端和PC端-根据发票ids获取详情-宁胜珑
export function postListByBillIds(data) {
  return request({
    url: `/api/cicada/CcdEntBill/listByBillIds`,
    method: 'post',
    data,
  })
}
