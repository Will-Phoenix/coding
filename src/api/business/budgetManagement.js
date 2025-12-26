import request from "@/utils/request";

// 预算管理-列表 --胜珑
export function getBudgetManagementList(data) {
  return request({
    url: '/ccdEntBudgetEntity/page',
    method: 'get',
    data,
  })
}

// 预算管理-新增 --胜珑
export function addBudget(data) {
  return request({
    url: '/ccdEntBudgetEntity/add',
    method: 'post',
    data
  })
}

// 预算管理-启用/禁用 --胜珑
export function updateBudgetStatus(data) {
  return request({
    url: '/ccdEntBudgetEntity/updateStatus',
    method: 'post',
    data
  })
}

// 预算管理-删除 --胜珑
export function deleteBudget(data) {
  return request({
    url: '/ccdEntBudgetEntity/remove',
    method: 'post',
    data
  })
}

// 预算管理-月度预算详情 --胜珑
export function getBudgetMonthDetail(data) {
  return request({
    url: '/ccdEntBudgetEntity/monthDetail',
    method: 'get',
    data,
  })
}

// 预算管理-统计月度明细的总预算金额和总剩余金额 --胜珑
export function getBudgetMonthStats(data) {
  return request({
    url: '/ccdEntBudgetEntity/statsAmount',
    method: 'get',
    data,
  })
}

// 预算管理-编辑月预算 --胜珑
export function updateTotalAmount(data) {
  return request({
    url: '/ccdEntBudgetEntity/updateTotalAmount',
    method: 'post',
    data
  })
}

// 预算管理-预算详细 --一帆
export function getBudgetDetailList(data) {
  return request({
    url: '/budgetDetail/list',
    method: 'get',
    data
  })
}

// 预算管理-预算详细新增 --一帆
export function saveBudgetDetail(data) {
  return request({
    url: '/budgetDetail/save',
    method: 'post',
    data
  })
}

// 预算管理-预算详细编辑 --一帆
export function updateBudgetDetail(data) {
  return request({
    url: '/budgetDetail/update',
    method: 'post',
    data
  })
}

// 预算管理-预算详细删除 --一帆
export function deleteBudgetDetail(data) {
  return request({
    url: '/budgetDetail/remove',
    method: 'post',
    data
  })
}

// 预算管理-预算详细下拉列表 --一帆
export function getBudgetDetailTree(data) {
  return request({
    url: '/budgetDetail/listByBudgetId',
    method: 'get',
    data
  })
}

// 预算管理-根据标签筛选出-预算树 --一帆
export function getBudgetTreeByLabel(data) {
  return request({
    url: '/budgetDetail/tree',
    method: 'get',
    data
  })
}

// 预算管理-报销单 --晓东
export function getBudgetDetailOrderPage(data) {
  return request({
    url: '/budgetDetail/orderPage',
    method: 'post',
    data
  })
}

export function getBudgetLabelList(data) {
  return request({
    url: '/budgetLabel/list',
    method: 'get',
    data
  })
}

// 预算管理-导出 --胜珑
export function budgetExport(data) {
  return request({
    url: '/budgetDetail/export',
    method: 'post',
    responseType: "blob",
    data
  })
}
