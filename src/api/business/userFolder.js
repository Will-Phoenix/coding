import request from '@/utils/request'

// 用户资料列表 --廖文强
export function getCcdUserFolderPage(data) {
  return request({
    url: '/ccdUserFolderEntity/center/page',
    method: 'post',
    data
  })
}

// 个人用户资料列表 --廖文强
export function getPersonalCcdUserFolderPage(data) {
  return request({
    url: '/ccdUserFolderEntity/page',
    method: 'post',
    data
  })
}

// 创建-用户资料 --廖文强
export function createCcdUserFolder(data) {
  return request({
    url: '/ccdUserFolderEntity/center/create',
    method: 'post',
    data
  })
}

//
// 修改-用户资料-文件名称 --廖文强
export function updateCcdUserFolder({ id, name }) {
  return request({
    url: '/ccdUserFolderEntity/center/update',
    method: 'post',
    data: {
      id,
      name,
    },
  })
}

// 删除-用户资料 --廖文强
export function deleteCcdUserFolder(id) {
  return request({
    url: `/ccdUserFolderEntity/${id}`,
    method: 'delete',
  })
}

// 用户资料-关联持有人 --廖文强
export function setHolderToUserFolder(data) {
  return request({
    url: '/ccdUserFolderEntity/center/setHolder',
    method: 'post',
    data
  })
}
