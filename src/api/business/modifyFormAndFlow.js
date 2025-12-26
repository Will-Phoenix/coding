import request from '@/utils/request'

// 通过name和单据类型查询报销单或审批单详情 --一帆
// name, orderBizType
export function getOrderDetailByName(data) {
  return request({
    url: '/api/cicada/updateOrder/getInfoByName',
    method: 'post',
    data
  })
}

// 修改流程记录        --一帆
// id, handleTime
export function updateTaskOperatorInfo(data) {
  return request({
    url: '/api/cicada/updateOrder/updateTaskOperatorInfo',
    method: 'post',
    data
  })
}

// 修改报销单或审批单信息        --一帆
// id, formData
export function updateJson(data) {
  return request({
    url: '/api/cicada/updateOrder/updateJson',
    method: 'post',
    data
  })
}
