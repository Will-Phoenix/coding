import request from "@/utils/request";

// 公告列表
export function getCcdNoticePage(data) {
  return request({
    url: '/api/cicada/ccdNotice/page',
    method: 'get',
    data
  })
}

// 公告详情
export function getCcdNoticeDetail(data) {
  return request({
    url: '/api/cicada/ccdNotice/detail',
    method: 'get',
    data
  })
}

// 公告删除
export function postCcdNoticeDelete(data) {
  return request({
    url: '/api/cicada/ccdNotice/remove',
    method: 'post',
    data
  })
}

// 公告新增
export function postCcdNoticeSaveOrUpdate(data) {
  return request({
    url: '/api/cicada/ccdNotice/saveOrUpdate',
    method: 'post',
    data
  })
}

// 用户公告列表
export function getUserCcdNoticePage(data) {
  return request({
    url: '/api/ccdNotice/page',
    method: 'get',
    data
  })
}

export function postCcdNoticeUpdateStatus(data) {
  return request({
    url: '/api/ccdNotice/updateStatus',
    method: 'post',
    data
  })
}
