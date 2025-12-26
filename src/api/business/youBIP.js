import request from '@/utils/request'

/**
 * 查询记账凭证空号 (制单页面查询空凭证号，三个参数会计年度，会计期间，帐薄编码，任意一个变化需要重新获取一下空号)  ---王冀超
 * @param params 参数 accbookCode 帐薄编码; period 会计期间; year 会计年度
 */
export function getBreakNo(params = { accbookCode: '', period: '', year: '' }) {
  return request({
    url: '/api/cicada/ccdFinEntVoucher/breakNo',
    method: 'get',
    data: { financialChannelCode: "YouBIP", ...params }
  })
}

// 查询 科目类型(科目属性) 枚举  enumSelect  -----廖文强
export function getSubjectAttributeEnum() {
  return request({
    url: `/ccdFinUnitSubjectEntity/enumSelect/SubjectAttributeEnum`,
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}
// 查询 科目方向 枚举  enumSelect  -----廖文强
export function getBalanceDirectionEnum() {
  return request({
    url: `/ccdFinUnitSubjectEntity/enumSelect/BalanceDirectionEnum`,
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

/**
 * 单位科目定义, 不分页 -----廖文强
 * @param searchKey (可选)搜索关键字
 * @param subAttr (可选)科目属性（例如：ASSET, LIABILITY)
 */
export function getFinUnitSubjectEntityList(searchKey, subAttr) {
  return request({
    url: `/ccdFinUnitSubjectEntity/list`,
    method: 'get',
    data: { financialChannelCode: "YouBIP", searchKey, subAttr }
  })
}

// 辅助核算配置列表(全量) --张一帆
export function getFinAssistAccountingList() {
  return request({
    url: '/ccdFinAssistAccountingEntity/list',
    method: 'get',
    data: { financialChannelCode: "YouBIP" }
  })
}

/**
 * 新增或更新凭证   ----王冀超;  如果是新增,则接口返回可以拿到 voucherId  【 {"code":200,"msg":"Success","data":{"voucherId":7}} 】
 * @param exsOrderId 报销单ID，新增时必填
 * @param voucherId 凭证ID，修改时必填
 * @param voucherJSON 记账凭证请求对象，用友渠道与用友凭证明细接口返回对象保持一致
 */
export function saveOrUpdateCcdFinEntVoucher(exsOrderId, voucherId, voucherJSON) {
  return request({
    url: voucherId ? '/api/cicada/ccdFinEntVoucher/update' : '/api/cicada/ccdFinEntVoucher/create',
    method: 'post',
    data: { financialChannelCode: "YouBIP", exsOrderId, voucherId, voucherJSON }
  })
}

/**
 * 查询凭证详情   ----王冀超
 * @param voucherId 凭证ID
 */
export function getFinEntVoucherDetail(voucherId) {
  return request({
    url: `/api/cicada/ccdFinEntVoucher/detail/${voucherId}`,
    method: 'get',
  })
}

// 根据科目查关联的辅助核算列表  -----张一帆
export function getAssistAccountingBySubject(code) {
  return request({
    url: `/ccdFinSubjectAssistAccountingRelationEntity/list`,
    method: 'get',
    data: { financialChannelCode: "YouBIP", code }
  })
}

// 根据报销单id，同步用友的记账凭证数据到我们系统   -----王冀超
export function syncVoucherFromYouBIP(data) {
  return request({
    url: "/api/cicada/ccdFinEntVoucher/syncVoucher",
    method: 'post',
    data
  })
}

export function exportDataBx(data) {
  return request({
    url: `/api/cicada/ccdExsOrder/export`,
    method: 'post',
    data
  })
}
