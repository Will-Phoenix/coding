import request from '@/utils/request'

// 预算项目管理-列表 --super飞
export function getBudgetList() {
  return request({
    url: '/ccdProjectBudgetEntity/list',
    method: 'get'
  })
}

// 预算项目管理-新增/编辑 --super飞
export function budgetSaveOrUpdate(data) {
  return request({
    url: '/ccdProjectBudgetEntity/saveOrUpdate',
    method: 'post',
    data
  })
}

// 预算项目管理-删除 --super飞
export function budgetDel(data) {
  return request({
    url: '/ccdProjectBudgetEntity/del',
    method: 'get',
    data
  })
}

// 预算项目分类管理-列表 --super飞
export function getSubjectClassificationList(data) {
  return request({
    url: '/ccdSubjectClassificationEntity/list',
    method: 'get',
    data
  })
}

// 预算项目分类管理-新增/编辑 --super飞
export function subjectClassificationSaveOrUpdate(data) {
  return request({
    url: '/ccdSubjectClassificationEntity/saveOrUpdate',
    method: 'post',
    data
  })
}

// 预算项目分类管理-删除 --super飞
export function subjectClassificationDel(data) {
  return request({
    url: '/ccdSubjectClassificationEntity/del',
    method: 'get',
    data
  })
}
