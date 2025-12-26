<template>
  <el-dialog
    title="详情"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="1200px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="center" v-loading="loading">
      <div v-html="html" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>

export default {
  name: 'HtmlDetailDialog',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    html: {
      type: String,
    },
  },
  data() {
    return {
    }
  },
  methods: {
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
