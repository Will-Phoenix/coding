import request from '@/utils/request'

// 判断是否有候选人
export const APICandidates = data => {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Candidates/0`,
    method: 'post',
    data
  });
};
// 获取引擎id
export const APIgetFlowIdByCode = enCode => {
  return request({
    url: `/api/workflow/Engine/flowTemplate/getFlowIdByCode/${enCode}`,
    method: 'get'
  });
};
// 获取流程
export const APIgetFlowList = id => {
  return request({
    url: `/api/workflow/Engine/flowTemplate/FlowJsonList/${id}`,
    method: 'get',
    params: { type: 1 }
  });
};
// 提交oa单
export const APIcreateFlowTask = data => {
  return request({
    url: '/api/workflow/Engine/FlowTask',
    method: 'post',
    data
  });
};
// 字典数据获取
export const APIgetDictionaryDataSelector = code => {
  return request({
    url: `/api/system/DictionaryData/${code}/Data/Selector`,
    method: 'get'
  });
};
// 城市
export const APIgetCity = nodeId => {
  return request({
    url: `/api/system/Area/${nodeId}`,
    method: 'get'
  });
};
// 城市(省市区,三级,全量)
export const APIgetCityAll = () => {
  return request({
    url: `/api/system/Area/all`,
    method: 'get'
  });
};
// 表单详情接
export const APIFlowBeforeInfo = id => {
  return request({
    url: `/api/workflow/Engine/FlowBefore/${id}`,
    method: 'get'
  });
};
// 查询审批通过的可供关联的申请单的列表
export const APIGetListCompleteOrders = () => {
  return request({
    url: `/api/cicada/ccdUnifiedApply/listCompleteOrders`,
    method: 'post',
    data: { idList: [] }
  });
};
// 查询审批通过的可供关联的申请单的列表, 根据type过滤
export const APIGetListCompleteOrdersByType = (orderType) => {
  return request({
    url: `/api/cicada/ccdUnifiedApply/listCompleteOrders`,
    method: 'post',
    data: { type: orderType, idList: [] }
  });
};
// 根据ID查询申请单详情(多条)
export const APIGetOrdersByIds = (ids) => {
  if (!ids || ids.length === 0) return Promise.resolve([]);
  return request({
    url: `/api/cicada/ccdUnifiedApply/listCompleteOrders`,
    method: 'post',
    data: { idList: ids }
  });
};
// 查询审批通过可供关联的审批单列表：拆分了“我的审批单”和“共享给我的”    exsBindFlag: 0为审批单  1为报销单
export const APIGetBindCompleteOrders = (params = { orderType: undefined, idList: [], exsBindFlag: 0 }) => {
  return request({
    url: `/api/cicada/ccdUnifiedApply/bindCompleteOrders`,
    method: 'post',
    data: {
      ...params
    }
  });
};
/**
 * 根据表单数据的主键id获取表单定义
 * @param ids 是表单数据的主键,也是工作流实例主键,也是订单id, (可以传多个用英文逗号分割的字符串, 也可以传数组)
 */
export const APIGetFormInfoByFormDataIds = (ids) => {
  const orderIds = ids instanceof Array ? ids.join(',') : ids;
  if (!orderIds || orderIds.length === 0) return Promise.resolve([]);
  return request({
    url: `/api/cicada/ccdFlowForm/listByOrderIds?orderIds=${orderIds}`,
    method: 'get'
  });
};

// 报销单列表
export const APIExpenseAccountList = data => {
  return request({
    url: `/api/cicada/ccdExsOrder/getList`,
    method: 'post',
    data
  });
};
// 业务流程模型
export const APICcdBizFlowModule = data => {
  return request({
    url: `/api/cicada/ccdBizFlowModule/list`,
    method: 'get',
    data
  });
};
// 根据表单ID获取表单编码
export const APIGetFormCodeById = id => {
  return request({
    url: `/api/flowForm/Form/${id}`,
    method: 'get'
  });
};
// 智能初审
export const APISmartAudit = data => {
  return request({
    url: `/api/cicada/ccdExsOrderMaster/smartAudit`,
    method: 'post',
    data
  });
};
// 删除草稿的报销单
export function DELETE(id) {
  return request({
    url: `/api/workflow/Engine/FlowLaunch/${id}`,
    method: 'delete'
  });
}
// 删除报销单草稿
export function OrderDelete(id) {
  return request({
    url: `/api/cicada/ccdExsOrderMaster/${id}`,
    method: 'delete'
  });
}
// 删除申请单草稿
export function ApplyOrderDelete(id) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/${id}`,
    method: 'delete'
  });
}

// 关联银行小票,返回小票信息
export const APIAssociatedBankReceipt = (ids) => {
  return request({
    url: `/api/cicada/ccdExsOrderMaster/associatedBankReceipt?ids=${ids}`,
    method: 'get'
  });
};

// 获取申请单报销标准
export const APIGetRulesByOrderId = (orderId) => {
  return request({
    url: `/api/cicada/ccdBizRules/getRulesByOrderId`,
    method: 'get',
    data: { orderId }
  });
};

// 根据用户获取对应的分类
export const APIGetOrderCategoryList = () => {
  return request({
    url: `/api/ccdOrderCategory/list`,
    method: 'get'
  });
};

// 根据审批类型id获取能发起的流程列表
export const APIGetOrderCategoryModuleList = (categoryId) => {
  return request({
    url: `/api/ccdOrderCategory/module/list`,
    method: 'get',
    data: { categoryId }
  });
};

// 报销列表
export const APIGetOrderCategoryExsOrderList = data => {
  return request({
    url: `/api/ccdOrderCategory/exsOrder/list`,
    method: 'post',
    data
  });
};

// 申请列表
export const APIGetOrderCategoryApplyOrderList = data => {
  return request({
    url: `/api/ccdOrderCategory/applyOrder/list`,
    method: 'post',
    data
  });
};
