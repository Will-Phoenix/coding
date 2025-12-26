import request from '@/utils/request'

export const APIGetStartChat = async(header) => {
  return request({
    url: `/api/alamo-ai/chat/start-chat`,
    method: 'get',
    headers: { ...header }
  });
};

export const APIGetKnowledgeList = async(header) => {
  return request({
    url: `/api/alamo-ai/knowledge-base/list-by-authorization-out`,
    method: 'get',
    headers: { ...header }
  });
};

// 获取讯飞websocket的url
export const getAudioToTextUrl = async() => {
  return request({
    url: `/assistant-dify/getAudioToTextUrl`,
    method: 'get'
  });
};

// 调用微信js-sdk，进行wx-config配置需要用到签名，但在webview中不需要配置config，暂时不用
export const generateSignature = (url) => {
  return request({
    url: `/assistant-dify/generateSignature`,
    method: 'get',
    data: {
      url
    }
  });
};
