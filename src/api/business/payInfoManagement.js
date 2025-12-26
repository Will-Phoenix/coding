import request from '@/utils/request'

// 报销支付明细列表
export function getCcdBankCardReimbursementEntity(data) {
  return request({
    url: '/ccdBankCardReimbursementEntity/detail',
    method: 'get',
    data
  })
}

// 新增/编辑报销支付明细
export function postCcdBankCardReimbursementEntitySaveOrUpdate(data) {
  return request({
    url: '/ccdBankCardReimbursementEntity/saveOrUpdate',
    method: 'post',
    data
  })
}

// 删除报销支付明细
export function postCcdBankCardReimbursementEntityRemove(data) {
  return request({
    url: '/ccdBankCardReimbursementEntity/remove',
    method: 'post',
    data
  })
}

// 新增/修改 公务卡报销明细表
export function postCcdBankCardReimbursementEntitySaveOrUpdateBusinessCard(data) {
  return request({
    url: '/ccdBankCardReimbursementEntity/saveOrUpdateBusinessCard',
    method: 'post',
    data
  })
}

// 删除公务卡报销明细表
export function postCcdBusinessCardReimbursementEntityRemove(data) {
  return request({
    url: '/ccdBusinessCardReimbursementEntity/remove',
    method: 'post',
    data
  })
}

// 推送到预算一体化
export function postSaveReimburseDatas(orderId) {
  return request({
    url: `/realware/unit/saveReimburseDatas?orderId=${orderId}`,
    method: 'post',
  })
}

// 取消推送
export function postDeleteReimburseData(orderId) {
  return request({
    url: `/realware/unit/deleteReimburseData?orderId=${orderId}`,
    method: 'post',
  })
}

// 修改订单推送状态为处理完成
export function postUpdatePayPushStatus(data) {
  return request({
    url: '/api/cicada/ccdExsOrder/updatePayPushStatus',
    method: 'post',
    data
  })
}

// 获取用途列表
export function getListUseDes() {
  return request({
    url: '/ccdBankCardReimbursementEntity/listUseDes',
    method: 'get',
  })
}
