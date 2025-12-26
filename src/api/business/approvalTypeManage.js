import request from "@/utils/request";

// 审批类型分页-宁胜珑
export function getCcdOrderCategoryPage(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/page',
    method: 'get',
    data
  })
}

// 审批类型新增---宁胜珑
export function postCcdOrderCategoryAdd(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/add',
    method: 'post',
    data
  })
}

// 审批类型编辑---宁胜珑
export function postCcdOrderCategoryUpdate(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/update',
    method: 'post',
    data
  })
}

// 审批类型启用/禁用-宁胜珑
export function postCcdOrderCategoryUpdateStatus(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/updateStatus',
    method: 'post',
    data
  })
}

// 用户审批单类型下拉框-宁胜珑
export function getCcdOrderCategoryDropdown(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/typeDropDownBox',
    method: 'get',
    data
  })
}

// 用户申请单管理-宁胜珑
export function getCcdOrderCategoryPageUserOrderManage(data) {
  return request({
    url: '/api/cicada/ccdOrderCategory/pageUserOrderManage',
    method: 'get',
    data
  })
}
