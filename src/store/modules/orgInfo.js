import { getOrgInfo } from "@/api/workFlow/FlowBefore";
const actions = {
  async getOrgAllInfo({ state, commit }) {
    if (Object.keys(state.orgAllInfo).length > 0) {
      return state.orgAllInfo;
    }
    const res = await getOrgInfo();
    commit("setOrgInfo", res.data);
    if (res.data.propertyJson) {
      commit("setPropertyJson", JSON.parse(res.data.propertyJson));
    }
    return res.data;
  },
  clearOrgAllInfo({ commit }) {
    return new Promise(resolve => {
      commit("setOrgInfo", {});
      commit("setPropertyJson", null);
      resolve()
    })
  }
}
export default {
  namespaced: true,
  state: {
    orgAllInfo: {},
    propertyJson: null
  },
  mutations: {
    setOrgInfo(state, info) {
      state.orgAllInfo = info
    },
    setPropertyJson(state, info) {
      state.propertyJson = info
    }
  },
  actions,
}
