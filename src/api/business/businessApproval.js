import request from '@/utils/request'

// 审批-新增 --王冀超
export function createCcdBizFlowModule(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/create',
    method: 'post',
    data
  })
}

// 审批-编辑 --王冀超
export function updateCcdBizFlowModule(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/update',
    method: 'post',
    data
  })
}

// 报销审批配置统一提交 --乔晓东
export function updateVersion(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/updateVersion',
    method: 'post',
    data
  })
}

// 审批-列表 --王冀超
export function getCcdBizFlowModuleList(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/list',
    method: 'get',
    data
  })
}

// 智能初审规则列表库 --王冀超
export function getCcdSmartAuditRuleList() {
  return request({
    url: '/api/cicada/ccdSmartAuditRule/list',
    method: 'get',
  })
}

// 智能初审规则列表库-根据id查询 --王冀超
export function getCcdSmartAuditRuleListByIds(ids) {
  return request({
    url: '/api/cicada/ccdSmartAuditRule/listByIds',
    method: 'get',
    data: {
      ids,
    },
  })
}

// 流程模型关联规则 --王冀超
export function relationSmartAuditRules(data = { bizFlowModuleId, auditRuleIds }) {
  return request({
    url: '/api/cicada/ccdBizFlowModule/relationSmartAuditRules',
    method: 'post',
    data,
  })
}

// 审批-详情 --王冀超
export function getCcdBizFlowModuleDetail(id) {
  return request({
    url: `/api/cicada/ccdBizFlowModule/detail/${id}`,
    method: 'get',
  })
}

// 模版详情-用印和签名列表  --王冀超
export function getFlowModuleSignSealList(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModuleSignSeal/list',
    method: 'get',
    data
  })
}

// 模版详情-流程节点列表  --王冀超
export function getNodeList(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModuleSignSeal/nodeList',
    method: 'get',
    data
  })
}

// 模版详情-新增用印或签名与该模型的关联关系 --王冀超
export function createFlowModuleSignSeal(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModuleSignSeal/create',
    method: 'post',
    data
  })
}

// 模版详情-编辑用印或签名与该模型的关联关系 --王冀超
export function updateFlowModuleSignSeal(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModuleSignSeal/update',
    method: 'post',
    data
  })
}

// 模版详情-删除用印或签名与该模型的关联关系 --王冀超
export function deleteFlowModuleSignSeal(id) {
  return request({
    url: `/api/cicada/ccdBizFlowModuleSignSeal/delete/${id}`,
    method: 'post',
  })
}

// 模版详情-更新用印签名位置 --王冀超
export function saveLocation(data) {
  return request({
    url: '/api/cicada/ccdBizFlowModuleSignSeal/saveLocation',
    method: 'post',
    data
  })
}

// 新增扩展单据打印模版
export function createAdditionPrint(data) {
  return request({
    url: '/api/cicada/ccdAdditionPrint/create',
    method: 'post',
    data
  })
}

// 修改扩展单据打印模版
export function updateAdditionPrint(data) {
  return request({
    url: '/api/cicada/ccdAdditionPrint/update',
    method: 'post',
    data
  })
}

// 扩展打印单据模版详
export function additionPrintDetail(id) {
  return request({
    url: `/api/cicada/ccdAdditionPrint/detail/${id}`,
    method: 'get',
  })
}

// 删除扩展打印单据
export function deleteAdditionPrint(id) {
  return request({
    url: `/api/cicada/ccdAdditionPrint/delete/${id}`,
    method: 'post',
  })
}

// 根据流程id-查询扩展打印单据列表
export function additionPrintList(data) {
  return request({
    url: '/api/cicada/ccdAdditionPrint/list',
    method: 'get',
    data
  })
}

// 根据订单-查询扩展打印单据列表
export function additionPrintListByOrder(data, headers = {}) {
  return request({
    url: '/api/cicada/ccdAdditionPrint/listSnapshotByOrder',
    method: 'get',
    headers: { ...headers },
    data
  })
}

// 根据资料夹的ID取结算信息里的附件信息
export function getUserFilesByIds(ids, headers = {}) {
  return request({
    url: `/ccdUserFolderEntity/details?ids=${ids}`,
    headers: { ...headers },
    method: 'get',
  })
}
