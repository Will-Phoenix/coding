<template>
  <el-dialog
    title="查看回复用户内容"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div>
      <div v-if="data" class="editor-rich-text-container" v-html="data"></div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>

export default {
  name: 'lookupContent',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: String,
      default: () => ("")
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {}
  },
  methods: {
    onConfirm() {
      this.updateVisible(false);
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
// 富文本样式
.editor-rich-text-container {
  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: 500;
    color: #292c33;
  }

  h1 {
    font-size: 24px;
    line-height: 33px;
  }

  h2 {
    font-size: 20px;
    line-height: 28px;
  }

  h3 {
    font-size: 17px;
    line-height: 24px;
  }

  h4 {
    font-size: 16px;
    line-height: 22px;
  }

  h5 {
    font-size: 15px;
    line-height: 21px;
  }

  p {
    font-size: 15px;
    font-weight: 400;
    color: #5c5f66;
    line-height: 26px;
  }

  strong {
  }

  code {
  }

  ul {
    list-style: disc;
    padding-left: 18px;
  }

  ol {
    list-style: auto;
    padding-left: 18px;
  }

  li {
    list-style: unset;
    font-size: 13px;
    font-weight: 400;
    color: #919499;
    line-height: 22px;
  }

  img,
  video {
    max-width: 100% !important;
  }
  table {
    border: 1px solid #ccc; /* 添加黑色边框 */
    border-collapse: collapse; /* 边框合并 */
  }

  /* 为表格单元格添加边框样式 */
  td, th {
    border: 1px solid #ccc; /* 添加黑色边框 */
    padding: 8px; /* 添加内边距 */
  }
}
</style>
