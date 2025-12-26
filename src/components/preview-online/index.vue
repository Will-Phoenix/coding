<template>
  <el-dialog
    :title="fileTitle"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    :fullscreen="fullScreen"
    @update:visible="updateVisible"
  >
    <div slot="title" class="title">
      <span>{{ fileTitle }}</span>
      <i class="el-icon-full-screen mg-r" @click="fullScreen = !fullScreen"></i>
    </div>
    <div v-loading="previewUrl === ''">
      <embed :src="previewUrl" :style="{width: '100%', height: fullScreen ? '80vh' : '60vh'}">
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { previewFileOnline } from "@/api/business/signature";

export default {
  name: 'accountVoucher',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    fileUrl: {
      type: String,
      default: ""
    },
    fileTitle: {
      type: String,
      default: ""
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      previewUrl: "", // 可以直接预览的url
      fullScreen: false, // 是否全屏
    }
  },
  watch: {
    visible(n) {
      if (n) {
        previewFileOnline(this.fileUrl).then(res => {
          this.previewUrl = res.data;
        });
      } else {
        this.previewUrl = "";
      }
    }
  },
  methods: {
    updateVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>
<style lang="scss" scoped>
  .dialog-footer {
    text-align: right;
    margin: 10px;
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mg-r {
    margin-right: 50px;
    cursor: pointer;
  }
  ::v-deep .el-dialog__body {
    max-height: 90vh !important;
  }
</style>
