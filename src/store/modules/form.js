import { FlowBeforeInfo } from '@/api/workFlow/FlowBefore'
import { getFlowList } from "@/api/workFlow/FlowEngine";
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    module: {}
  },
  mutations: {
    setModule(state, info) {
      state.module = info
    }
  },
  actions: {
    async getModule({ state }, id) {
      if (state.module[id]) {
        return state.module[id]
      }
      const res = await FlowBeforeInfo(id)
      if (!res.data.moduleJson) {
        const res2 = await getFlowList(res.data.flowTemplateInfo.templateId, '1')
        res.data.moduleJson = JSON.parse(res2.data[0].flowTemplateJson).properties.moduleJson
      }
      Vue.set(state.module, id, res.data)
      return res.data
    }
  }
}
