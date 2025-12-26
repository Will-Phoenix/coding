import request from "@/utils/request";

// 单位科目定义列表
export function getFinUnitSubjectEntityList(data) {
  return request({
    url: '/ccdFinUnitSubjectEntity/list',
    method: 'get',
    data: { financialChannelCode: "YouBIP", ...data }
  })
}

// 新增单位科目定义
export function postFinUnitSubjectEntitySave(data) {
  return request({
    url: '/ccdFinUnitSubjectEntity/save',
    method: 'post',
    data: { financialChannelCode: "YouBIP", ...data }
  })
}

// 更新单位科目定义
export function postFinUnitSubjectEntityUpdate(data) {
  return request({
    url: '/ccdFinUnitSubjectEntity/update',
    method: 'post',
    data: { financialChannelCode: "YouBIP", ...data }
  })
}

// 删除单位科目定义
export function postFinUnitSubjectEntityDelete(id) {
  return request({
    url: `/ccdFinUnitSubjectEntity/${id}`,
    method: 'delete',
    data: { financialChannelCode: "YouBIP" }
  })
}

// 获取余额方向枚举值
export function getBalanceDirectionEnum() {
  return request({
    url: `/ccdFinUnitSubjectEntity/enumSelect/BalanceDirectionEnum`,
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

// 获取科目属性枚举值
export function getSubjectAttributeEnum() {
  return request({
    url: `/ccdFinUnitSubjectEntity/enumSelect/SubjectAttributeEnum`,
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

export function downloadExcelTemplate() {
  return request({
    url: `/ccdFinUnitSubjectEntity/downloadExcelTemplate`,
    method: 'get',
    responseType: "blob",
    data: { financialChannelCode: "YouBIP" }
  })
}

export function importUnitSubjectEntity(file) {
  let formData = new FormData();
  formData.append("file", file);
  formData.append("financialChannelCode","YouBIP")
  return request({
    url: `/ccdFinUnitSubjectEntity/imports`,
    method: 'post',
    responseType: "blob",
    data: formData
  })
}

// 辅助核算配置列表
export function getFinAssistAccountingEntityList() {
  return request({
    url: '/ccdFinAssistAccountingEntity/list',
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

