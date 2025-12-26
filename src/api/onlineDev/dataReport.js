import { reportServer } from '@/utils/define'
import request from '@/utils/request'

// 获取报表列表
export const getDataReportList = data => {
  return request({
    url: '/api/datareport/Data',
    baseURL: reportServer,
    method: 'GET',
    data
  })
}
// 获取报表下拉列表
export const getDataReportSelector = () => {
  return request({
    url: '/api/datareport/Data/Selector',
    baseURL: reportServer,
    method: 'GET'
  })
}
// 删除报表
export const delDataReport = id => {
  return request({
    url: `/api/datareport/Data/${id}`,
    baseURL: reportServer,
    method: 'delete'
  })
}
// 复制报表
export const copyDataReport = id => {
  return request({
    url: `/api/datareport/Data/Copy/${id}`,
    baseURL: reportServer,
    method: 'post'
  })
}
