import request from '@/utils/request'

// 辅助核算配置列表 --张一帆
export function getFinAssistAccountingList() {
  return request({
    url: '/ccdFinAssistAccountingEntity/list',
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

// 辅助核算配置列表-新增 --张一帆
export function finAssistAccountingSave(data) {
  return request({
    url: '/ccdFinAssistAccountingEntity/save',
    method: 'post',
    data
  })
}

// 辅助核算配置列表-编辑 --张一帆
export function finAssistAccountingEdit(data) {
  return request({
    url: '/ccdFinAssistAccountingEntity/edit',
    method: 'post',
    data
  })
}

// 辅助核算配置列表-删除 --张一帆
export function finAssistAccountingDelete(data) {
  return request({
    url: '/ccdFinAssistAccountingEntity/delete',
    method: 'post',
    data
  })
}

// 辅助核算配置列表-动态表单list --张一帆
export function getDynamicTableList(data) {
  return request({
    url: '/ccdFinAssistAccountingEntity/dynamicTable/list',
    method: 'get',
    data
  })
}
