<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'发票抬头'"
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
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="单位/企业名称" prop="name">
        <el-input v-model="formData.name" placeholder="单位/企业名称" />
      </el-form-item>
      <el-form-item label="税号" prop="tin">
        <el-input v-model="formData.tin" placeholder="请输入税号" />
      </el-form-item>
      <el-form-item label="单位地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入单位地址" />
      </el-form-item>
      <el-form-item label="电话号码" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入电话号码" />
      </el-form-item>
      <el-form-item label="开户银行" prop="bankName">
        <el-input v-model="formData.bankName" placeholder="请输入开户银行" />
      </el-form-item>
      <el-form-item label="银行账户" prop="bankAccount">
        <el-input v-model="formData.bankAccount" placeholder="请输入银行账户" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { postCcdInvoiceTitleSubmit } from "@/api/business/invoiceTitle";

export default {
  name: 'addInvoiceTitle',
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
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      formData: {
        name: '',
        tin: '',
        address: '',
        phone: '',
        bankName: '',
        bankAccount: '',
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        tin: [{ required: true, message: '请输入' }],
        /* address: [{ required: true, message: '请输入' }],
        bankName: [{ required: true, message: '请输入' }],
        bankAccount: [{ required: true, message: '请输入' }], */
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 编辑
        if (this.data.id) {
          for (const key in this.formData) {
            this.formData[key] = this.data[key]
          }
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = {
          name: '',
          tin: '',
          address: '',
          phone: '',
          bankName: '',
          bankAccount: '',
        }
      }
    },
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.data.id) {
            postCcdInvoiceTitleSubmit({ ...this.formData, id: this.data.id }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postCcdInvoiceTitleSubmit({ ...this.formData }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          }
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
.option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .option-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep .el-select-dropdown__item{
  height: 40px;
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .row-img {
    width: 32px;
    height: 32px;
  }
}
</style>
