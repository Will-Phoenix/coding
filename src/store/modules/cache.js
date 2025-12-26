import request from '@/utils/request'
import { downloadFile } from "@/api/business/signature";

export default {
  namespaced: true,
  state: {
    // 表单编码-> {表单id , 表单name, 菜单id} 映射表
    formCodeInfoMap: {
      // xxx: { id: "", name: "", menuId: "" }
    },
    imageMap: {
    },
  },
  mutations: {},
  actions: {
    async getFormInfoByCode({ state }, formCode) {
      if (!formCode) return {};
      let info = state.formCodeInfoMap[formCode]
      if (!info) {
        try {
          const res = await request({
            // 根据动态表单code获取id   ---张一帆
            url: `/ccdFinAssistAccountingEntity/dynamicTable/getId`,
            method: 'get',
            data: { code: formCode }
          })
          info = res.data
          state.formCodeInfoMap = { ...state.formCodeInfoMap, [formCode]: info }
        } catch (e) {
          console.error(e)
        }
      }
      return info || {};
    },
    async getImageUrl({ state }, id) {
      if (!id) return ''
      if (state.imageMap[id]) return state.imageMap[id]
      const res = await downloadFile(id)
      state.imageMap[id] = res.data.url
      return res.data.url
    }
  }
}
