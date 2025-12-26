import request from '@/utils/request'

// 待付款管理列表 -- 张一帆
export function getPayInfoList(data) {
  return request({
    url: '/ccdOrderToPayInfoEntity/page',
    method: 'get',
    data
  })
}

// 待付款管理-统计 -- 张一帆
export function getStatistic() {
  return request({
    url: '/ccdOrderToPayInfoEntity/statistic',
    method: 'get',
  })
}

// 待付款管理-新增 -- 张一帆
export function savePayInfo(data) {
  return request({
    url: '/ccdOrderToPayInfoEntity/save',
    method: 'post',
    data
  })
}

// 待付款管理-编辑 -- 张一帆
export function updatePayInfo(data) {
  return request({
    url: '/ccdOrderToPayInfoEntity/update',
    method: 'post',
    data
  })
}

// 待付款管理-标记为已付款 -- 张一帆
export function updatePageStatus(id) {
  return request({
    url: '/ccdOrderToPayInfoEntity/updatePageStatus',
    method: 'post',
    data: {
      id
    }
  })
}

// 待付款管理-删除 -- 张一帆
export function removePayInfo(id) {
  return request({
    url: '/ccdOrderToPayInfoEntity/remove',
    method: 'post',
    data: {
      id
    }
  })
}

// 待付款管理-通过银行卡号获取开户行 -- 张一帆
export function getBankName(payeeAccount) {
  return request({
    url: '/ccdOrderToPayInfoEntity/getBankName',
    method: 'get',
    data: {
      payeeAccount,
    }
  })
}

// 待付款管理-导出 -- 乔晓东
export function exportPayInfo(ids) {
  return request({
    url: '/ccdOrderToPayInfoEntity/export',
    method: 'post',
    responseType: "blob",
    data: {
      ids,
    }
  })
}
