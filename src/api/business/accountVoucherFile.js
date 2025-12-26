import request from '@/utils/request'

// 新增-记账凭证文件
export function createAccountingVoucherAttachment(data) {
  return request({
    url: '/api/cicada/ccdAccountingVoucherAttachment/create',
    method: 'post',
    data
  })
}

// 删除-记账凭证文件
export function deleteAccountingVoucherAttachment(id) {
  return request({
    url: `/api/cicada/ccdAccountingVoucherAttachment/delete/${id}`,
    method: 'post',
  })
}

// 删除-记账凭证文件
export function getAccountingAttachmentPage(data) {
  return request({
    url: `/api/cicada/ccdAccountingVoucherAttachment/page`,
    method: 'get',
    data,
  })
}

