import request from '@/utils/request'

// 获取岗位/角色/用户权限树形结构及数据
export const getAuthorizeValues = (objectId, data) => {
  return request({
    url: `/api/permission/Authority/Data/${objectId}/Values`,
    method: 'POST',
    data
  })
}

// 更新岗位/角色/用户权限
export const updateAuthorizeList = (objectId, data) => {
  return request({
    url: `/api/permission/Authority/Data/${objectId}`,
    method: 'PUT',
    data
  })
}

// 批量设置权限
export const updateBatchAuthorize = (data) => {
  return request({
    url: `/api/permission/Authority/Data/Batch`,
    method: 'POST',
    data
  })
}
// 获取功能权限数据
export const getModelData = (id, ObjectType) => {
  return request({
    url: `/api/permission/Authority/Model/${id}/${ObjectType}`,
    method: 'GET'
  })
}
// 设置/更新功能权限
export const setModelData = (id, data) => {
  return request({
    url: `/api/permission/Authority/Model/${id}`,
    method: 'PUT',
    data
  })
}

// 设置/更新功能权限
export const loginByCode = (param) => {
  const time = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  const uuid = 'socials_' + random + String(time);
  return request({
    url: `/api/oauth/Login`,
    // http://localhost:30000/api/oauth/Login?grant_type=socials&code=123&state=1&source=gtzw&uuid=1
    method: 'post',
    params: {
      grant_type: "socials",
      source: "gtzw",
      uuid: uuid,
      ...param,
    },
    meta: { needToken: false, errorTitle: "登录失败" },
  })
}
