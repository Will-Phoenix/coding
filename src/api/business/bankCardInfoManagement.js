import request from '@/utils/request'

// 分页
export function getCcdUserBankPage(data) {
  return request({
    url: '/api/cicada/ccdUserBank/page',
    method: 'get',
    data
  })
}

// 新增/编辑
export function postCcdUserBankSaveOrUpdate(data) {
  return request({
    url: '/api/cicada/ccdUserBank/saveOrUpdate',
    method: 'post',
    data
  })
}

// 删除
export function postCcdUserBankRemove(data) {
  return request({
    url: '/api/cicada/ccdUserBank/remove',
    method: 'post',
    data
  })
}
