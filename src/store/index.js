import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

import app from './modules/app'
import base from './modules/base'
import generator from './modules/generator'
import permission from './modules/permission'
import settings from './modules/settings'
import tagsView from './modules/tagsView'
import user from './modules/user'
import cache from "./modules/cache"
import form from "./modules/form"
import orgInfo from "@/store/modules/orgInfo";

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: { app, base, generator, permission, settings, tagsView, user, cache, form, orgInfo },
  getters
})

export default store
