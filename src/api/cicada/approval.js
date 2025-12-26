import request from '@/utils/request'

export function FlowBeforeList(category, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/List/${category}`,
    method: 'get',
    data
  });
}

// 获取待我审批信息
export function FlowBeforeInfo(id, data = {}, headers = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/${id}`,
    method: 'get',
    data,
    headers: { ...headers },
  });
}

// 待我审核审核
export function Audit(taskId, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Audit/${taskId}`,
    method: 'post',
    data
  });
}

// 待我审核退回
export function Reject(taskId, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Reject/${taskId}`,
    method: 'post',
    data
  });
}

export function Revoke(taskId, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowLaunch/${taskId}/Actions/Withdraw`,
    method: 'put',
    data
  });
}

// 获取流程发起列表
export function FlowLaunchList(data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowLaunch`,
    method: 'get',
    data
  });
}

/**
 * 判断是否有候选人
 * @param id 是taskId
 * @param data  data.id就是表单的数据的id
 */
export function Candidates(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Candidates/${id}`,
    method: 'post',
    data
  });
}

// 获取退回下拉接口
export function RejectList(taskId) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/RejectList/${taskId}`,
    method: 'get'
  });
}

// 待审核和已审核的数据统计
export function APIGetStatusNum() {
  return request({
    url: `/api/workflow/Engine/FlowBefore/stat`,
    method: 'get'
  });
}

// 已报销和报销中的统计
export function APIGetAppIndexStatistics() {
  return request({
    url: `/api/cicada/ccdExsOrder/appIndexStatistics`,
    method: 'get'
  });
}

// 获取常用数据
export function APIGetAppPopular() {
  return request({
    url: `/api/cicada/CcdEnum/oftenUsed/information`,
    method: 'get'
  });
}

export function APIPostOfen(data) {
  return request({
    url: `/api/cicada/CcdEnum/oftenUsed/information/save`,
    method: 'post',
    data
  });
}

export function APIGetListSign(data) {
  return request({
    url: `/api/cicada/CcdSignSeal/listSignByUserIds`,
    method: 'get',
    data
  });
}

export function APIGetSignByUserId(data) {
  return request({
    url: `/api/cicada/CcdSignSeal/getSignByUserId`,
    method: 'post',
    data
  });
}

export function APIPostCreateSign(data) {
  return request({
    url: `/api/cicada/CcdSignSeal`,
    method: 'post',
    data
  });
}

// 快速审核通过
export function APIPostFastAudit(taskId, account, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/AuditMock/${taskId}/${account}`,
    method: 'post',
    data
  });
}

// 快速审核驳回
export function APIPostFastReject(taskId, account, data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/RejectMock/${taskId}/${account}`,
    method: 'post',
    data
  });
}

// 获取最新审批流信息
export function APIGetBizFlowModuleDetail(bizFlowModuleId) {
  return request({
    url: `/api/cicada/ccdBizFlowModule/detail/${bizFlowModuleId}`,
    method: 'get'
  });
}

// 快速审核驳回
export function APIPostCandidateUser(data = {}) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/CandidateUser/0`,
    method: 'post',
    data
  });
}

// 共享审批单
export function APIPostShareOrder(data) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/shareOrder`,
    method: 'post',
    data
  });
}

// 共享审批单-回显已选用户
export function APIGetShareOrderDetail(data) {
  return request({
    url: `/api/cicada/ccdUnifiedApply/shareOrderDetail`,
    method: 'get',
    data
  });
}

// 差旅报销单-根据关联审批单和关联发票，生成表单数据，用来填充动态表单
export function APISmartTravelFrom(data) {
  return request({
    url: `/api/ccdEntTravleSmart/smartTravleFrom`,
    method: 'post',
    data
  });
}

// 根据发票查询订单信息
export function APIGetInfoByBillId(id, data) {
  return request({
    url: `/api/cicada/ccdExsOrderMaster/infoByBillId/${id}`,
    method: 'get',
    data
  });
}

// 差旅报销单-根据出差人、目的地、天数，计算差旅报销标准、金额和行程等信息（用于差旅报销单表单中的ai智能提醒）
export function APIGetOrderAIRule(data = { userIds: "", areaIds: "", days: "", vehicleType: "" }) {
  return request({
    url: `/api/cicada/ccdBizRules/order_ai_rule`,
    method: 'get',
    data
  });
}

// 出差申请单-根据出差人和目的地，计算差旅报销标准和行程等信息（用于出差申请单中的ai智能提醒）
export function APIGetApplyAIRule(data = { userIds: "", areaIds: "" }) {
  return request({
    url: `/api/cicada/ccdBizRules/apply_ai_rule`,
    method: 'get',
    data
  });
}

// 出差申请单详情-根据出差申请单id，获得差旅报销标准、金额和行程等信息（用于出差申请单详情中的ai智能提醒）
export function APIGetRulesByOrderId(orderId) {
  return request({
    url: `/api/cicada/ccdBizRules/getRulesByOrderId`,
    method: 'get',
    data: {
      orderId
    }
  });
}
