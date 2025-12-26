<template>
  <el-dialog
    title="修改文件名称"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="600px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="文件名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入" clearable maxlength="30" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="buttonLoading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { updateCcdUserFolder } from "@/api/business/userFolder";

export default {
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
    data: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      formData: {},
      rules: {
        name: [{ required: true, message: '请输入' }],
      },
      buttonLoading: false,
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.formData = { ...this.data };
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.buttonLoading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          try {
            updateCcdUserFolder(this.formData).then(() => {
              this.$message.success("修改成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } finally {
            this.buttonLoading = false;
          }
        }
      })
    },
    updateVisible(val) {
      this.$refs.form.resetFields();
      this.$emit('update:visible', val);
    },
  }
}
</script>
<style lang="scss" scoped></style>
