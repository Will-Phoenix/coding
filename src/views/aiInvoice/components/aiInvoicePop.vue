<template>
  <el-dialog
    title="Ai便捷报销"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="500px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content">您当前有{{ num }}张发票符合便捷报销要求，是否前往进行便捷报销？</div>
    <span slot="footer" class="dialog-footer">
      <el-button class="btn-cancel" @click="updateVisible(false)">知道了</el-button>
      <el-button class="btn-confirm" @click="onConfirm">去便捷报销</el-button>
    </span>
  </el-dialog>
</template>
<script>

export default {
  name: 'AIInvoicePop',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    num: {
      type: Number,
      default: 0
    },
  },
  methods: {
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    onConfirm() {
      this.updateVisible(false);
      this.$emit('confirm');
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px 20px !important;
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .btn-confirm {
    width: 120px;
    height: 42px;
    background: #00B4C4;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 20px;
    margin-left: 20px;
  }
  .btn-cancel {
    width: 120px;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #00B4C4;
    font-weight: 500;
    font-size: 14px;
    color: #00B4C4;
    line-height: 20px;
  }
}
</style>
