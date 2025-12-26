import request from '@/utils/request'

// getHistoricalVouchersList 获取历史凭证列表
export function getHistoricalVouchersList(params) {
  const { year, month, accountCode } = params;
  return request({
    url: `/api/cicada/ccdFinEntVoucher/getHistoricalVouchersList?year=${year}&month=${month}&accountCode=${accountCode}`,
    method: 'get',
    params
  })
}
