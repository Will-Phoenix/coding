import request from '@/utils/request'

// 问题反馈分页列表-实施后台接口-宁胜珑
export function getFeedbackPage(data) {
  return request({
    url: '/api/cicada/feedback/page',
    method: 'get',
    data
  })
}

// 回复或重新编辑回复-实施后台接口-宁胜珑
export function postUpdateFeedback(data) {
  return request({
    url: '/api/cicada/feedback/update',
    method: 'post',
    data
  })
}
