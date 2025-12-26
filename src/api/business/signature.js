import request from '@/utils/request'

// 印章签名-新增 --王冀超
export function createCcdSignSeal(data) {
  return request({
    url: '/api/cicada/CcdSignSeal',
    method: 'post',
    data
  })
}

// 印章签名-列表 --王冀超
export function getCcdSignSealList(data) {
  return request({
    url: '/api/cicada/CcdSignSeal/getList',
    method: 'post',
    data
  })
}

// 印章签名-编辑 --王冀超
export function updateCcdSignSeal(data) {
  return request({
    url: `/api/cicada/CcdSignSeal/${data.id}`,
    method: 'put',
    data
  })
}

// 印章签名-删除 --王冀超
export function deleteCcdSignSeal(id) {
  return request({
    url: `/api/cicada/CcdSignSeal/${id}`,
    method: 'delete',
  })
}

// 下载
export function downloadFile(id) {
  return request({
    url: `/api/biz/ccdFile/download/${id}`,
    method: 'post',
  })
}

// 获取在线预览文件url
export function previewFileOnline(fileDownloadUrl, headers = {}) {
  return request({
    url: `/api/biz/ccdFile/uploader/preview`,
    method: 'get',
    data: {
      fileDownloadUrl,
    },
    headers: { ...headers },
  })
}

// 根据文件id获取文件下载地址   ----(批量)
export function downloadFileBatch(ids, headers) {
  return request({
    url: `/api/biz/ccdFile/downloadBatch/${ids}`,
    method: 'post',
    headers: { ...headers },
  })
}

