import request from '@/utils/request'

// 发票共享人分页列表
export function sharerPage(data) {
  return request({
    url: '/ccdShareBill/page',
    method: 'get',
    data
  })
}

// 新增发票共享人
export function sharerSave(data) {
  return request({
    url: '/ccdShareBill/save',
    method: 'post',
    data
  })
}

// 删除发票共享人
export function sharerRemove(data) {
  return request({
    url: `/ccdShareBill/remove`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}
