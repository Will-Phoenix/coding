import request from "@/utils/request";

// 邮箱票池列表
export function getMailboxTicketPoolList(data) {
  return request({
    url: '/api/cicada/CcdEntBillCenter/emailTicketPoolList',
    method: 'post',
    data
  })
}
// 获取邮箱信息
export function getMailboxInfo() {
  return request({
    url: '/api/cicada/email/getInfo',
    method: 'get',
    data: { type: 1 } // 类型1、企业邮箱 2 个人邮箱
  })
}

// 配置邮箱信息
export function setMailboxInfo(data) {
  return request({
    url: '/api/cicada/email/createOrUpdate',
    method: 'post',
    data
  })
}

// 邮箱验证
export function verifyMail() {
  return request({
    url: '/api/cicada/email/verifyMail',
    method: 'get',
    data: { type: 1 } // 类型1、企业邮箱 2 个人邮箱
  })
}
