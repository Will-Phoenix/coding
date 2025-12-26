<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'银行卡'"
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
      <el-form-item label="姓名/名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名/名称" />
      </el-form-item>
      <el-form-item label="银行账户" prop="bankNumber">
        <el-input v-model="formData.bankNumber" placeholder="请输入银行账户" />
      </el-form-item>
      <el-form-item label="卡类型" prop="cardType">
        <el-select v-model="formData.cardType" placeholder="请选择卡类型">
          <el-option label="银行卡" :value="1" />
          <el-option label="公务卡" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="开户银行" prop="baseOpened">
        <el-input v-model="formData.baseOpened" placeholder="请输入开户银行" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="submitLoading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { postCcdUserBankSaveOrUpdate } from "@/api/business/bankCardInfoManagement";

export default {
  name: 'addBankCardInfo',
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
        bankNumber: '',
        cardType: '',
        baseOpened: '',
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        bankNumber: [{ required: true, message: '请输入' }],
        cardType: [{ required: true, message: '请选择' }],
        baseOpened: [{ required: true, message: '请输入' }],
      },
      submitLoading: false
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
          bankNumber: '',
          cardType: '',
          baseOpened: '',
        }
      }
    },
  },
  methods: {
    onConfirm() {
      if (this.submitLoading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.data.id) {
            postCcdUserBankSaveOrUpdate({ ...this.formData, id: this.data.id }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            }).finally(() => {
              this.submitLoading = false;
            });
          } else {
            postCcdUserBankSaveOrUpdate({ ...this.formData }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            }).finally(() => {
              this.submitLoading = false;
            });
          }
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    validatePassBankCard(rule, value, callback) {
      if (value === '' || value == null) {
        callback(new Error("请输入"));
      } else if (!/^\d{16,19}$/.test(`${value}`)) {
        callback(new Error("请输入正确的银行卡号"));
      } else {
        callback();
      }
    }
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
