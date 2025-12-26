import request from '@/utils/request'

// 获取列表
export function getPrintDevList(data) {
  return request({
    url: '/api/system/printDev',
    method: 'get',
    data
  })
}
// 获取列表下拉,根据ids
export function printOptionsApi(data) {
  return request({
    url: '/api/system/printDev/getListOptions',
    method: 'post',
    data
  })
}

// 获取详情
export function getPrintDevInfo(id, headers = {}) {
  return request({
    url: `/api/system/printDev/${id}`,
    method: 'get',
    headers: { ...headers }
  })
}

// 删除
export function Delete(id) {
  return request({
    url: `/api/system/printDev/${id}`,
    method: 'DELETE'
  })
}
// 修改
export function Update(data) {
  return request({
    url: `/api/system/printDev/${data.id}`,
    method: 'PUT',
    data
  })
}
// 新建
export function Create(data) {
  return request({
    url: '/api/system/printDev',
    method: 'post',
    data
  })
}
// 复制
export function Copy(id) {
  return request({
    url: `/api/system/printDev/${id}/Actions/Copy`,
    method: 'POST'
  })
}
// 导出
export function exportTpl(id) {
  return request({
    url: `/api/system/printDev/${id}/Actions/Export`,
    method: 'get'
  })
}
// 获取下拉框列表
export function getPrintDevSelector(type) {
  return request({
    url: '/api/system/printDev/Selector',
    method: 'GET',
    data: { type }
  })
}
// 更新状态
export function setState(id) {
  return request({
    url: `/api/system/printDev/${id}/Actions/State`,
    method: 'PUT'
  })
}
// 获取表单字段
export function getFields(data) {
  return request({
    url: `/api/system/printDev/Fields`,
    method: 'post',
    data
  })
}
// 获取数据和打印模板
export function getData(data, headers = {}) {
  return request({
    url: `/api/system/printDev/Data`,
    method: 'get',
    headers: { ...headers },
    data,
  })
}

// 获取数据和打印模板
export function getBatchData(data) {
  return request({
    url: `/api/system/printDev/BatchData`,
    method: 'get',
    data
  })
}

// 根据订单查询该订单相关签名及盖章记录(渲染打印模版用)
export function getCcdSignSealRecordList(data = { orderType: '', orderId: '', additionPrintId: '' }, headers = {}) {
  return request({
    url: `/api/cicada/ccdSignSealRecord/list`,
    method: 'get',
    data: { ...data },
    headers: { ...headers },
  })
}

// 根据订单查询该订单的出差人签名---相对独立与打印模板里配置的，因为签名位置无法更改，写死的
export function getlistTravelUsersSign(exsOrderId, headers = {}) {
  return request({
    url: `/api/cicada/CcdSignSeal/listTravelUsersSign`,
    method: 'get',
    data: {
      exsOrderId,
    },
    headers: { ...headers },
  })
}
