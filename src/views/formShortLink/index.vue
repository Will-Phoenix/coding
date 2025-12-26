
<template>
  <component :is="currentView" :config="config" :modelId="modelId" :isPreview="isPreview"
    v-show="showPage" />
</template>

<script>
import { getConfigData } from '@/api/onlineDev/webDesign'
import Form from './form'
import List from './list'
import { message } from '@/utils/message'

export default {
  name: 'formShortLink',
  components: { Form, List },
  data() {
    return {
      currentView: '',
      showPage: false,
      isPreview: false,
      modelId: '',
      config: {}
    }
  },
  created() {
    this.modelId = this.$route.query.modelId
    const type = this.$route.query.type ? this.$route.query.type : ''
    if (!this.modelId) return
    this.getConfigData({ type })
  },
  methods: {
    getConfigData(previewType) {
      getConfigData(this.modelId, previewType).then(res => {
        if (res.code !== 200 || !res.data) {
          this.$store.dispatch('tagsView/delView', this.$route)
          this.$router.replace('/404')
          message({
            message: res.msg || '请求出错，请重试',
            type: 'error',
            duration: 1500,
          })
          return
        }
        this.config = res.data
        if (this.$route.query.type == 'form') {
          this.currentView = 'Form'
        } else {
          this.currentView = 'List'
        }
        this.showPage = true
      }).catch(() => { })
    }
  }
}
</script>
<style lang="scss" scoped>
.table {
  width: 80%;
}
</style>

