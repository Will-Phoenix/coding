import request from "@/utils/request";

// 发票抬头列表
export function getCcdInvoiceTitlePage(data) {
  return request({
    url: '/api/cicada/ccdEntBillInvoiceTitle/page',
    method: 'get',
    data
  })
}

// 发票抬头详情
export function getCcdInvoiceTitleDetail(data) {
  return request({
    url: '/api/cicada/ccdEntBillInvoiceTitle/detail',
    method: 'get',
    data
  })
}

// 发票抬头删除
export function postCcdInvoiceTitleDelete(data) {
  return request({
    url: '/api/cicada/ccdEntBillInvoiceTitle/remove',
    method: 'post',
    data
  })
}

// 发票抬头新增
export function postCcdInvoiceTitleSubmit(data) {
  return request({
    url: '/api/cicada/ccdEntBillInvoiceTitle/submit',
    method: 'post',
    data
  })
}
