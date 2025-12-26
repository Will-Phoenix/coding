<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'公务卡支付明细'"
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
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="付款金额" prop="payMoney">
        <el-input v-model="formData.payMoney" placeholder="请输入付款金额" />
      </el-form-item>
      <el-form-item label="刷卡日期" prop="bizCardDate">
        <el-date-picker
          v-model="formData.bizCardDate"
          type="date"
          placeholder="请选择刷卡日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { postCcdBankCardReimbursementEntitySaveOrUpdateBusinessCard } from "@/api/business/payInfoManagement";

export default {
  name: 'addBizCardPayInfo',
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
        payMoney: '',
        bizCardDate: '',
      },
      rules: {
        payMoney: [{ required: true, validator: this.validateAmount, trigger: 'blur' }],
        bizCardDate: [{ required: true, message: '请选择' }],
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 编辑
        if (this.data.costId) {
          for (const key in this.formData) {
            this.formData[key] = this.data[key]
          }
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = {
          payMoney: '',
          bizCardDate: '',
        }
      }
    },
  },
  methods: {
    validateAmount(rule, value, callback) {
      if (value === '' || value == null) {
        callback(new Error("请输入金额"));
      } else if (!/^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/.test(`${value}`)) {
        callback(new Error("请输入金额"));
      } else {
        callback();
      }
    },
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.data.costId) {
            postCcdBankCardReimbursementEntitySaveOrUpdateBusinessCard({ ...this.formData, costId: this.data.costId, rpayId: this.data.rpayId }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postCcdBankCardReimbursementEntitySaveOrUpdateBusinessCard({ ...this.formData, rpayId: this.data.rpayId }).then(() => {
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
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .flex1 {
    flex: 1;
  }
}
</style>
