<template>
  <el-dialog
    title="编辑月预算"
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
      <div class="month">月度：{{ data.month }}月份</div>
      <el-form-item label="总计金额" prop="totalAmount">
        <el-input-number v-model="formData.totalAmount" :min="0" placeholder="请输入" :controls="false" style="width: 100%" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { updateTotalAmount } from "@/api/business/budgetManagement";

export default {
  name: 'editMonthBudget',
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
        totalAmount: '',
      },
      rules: {
        totalAmount: [{ required: true, message: '请输入' }],
      },
    };
  },
  watch: {
    visible(n) {
      if (n) {
        for (const key in this.formData) {
          this.formData[key] = this.data[key]
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          updateTotalAmount({ id: this.data.id, ...this.formData }).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm');
            this.updateVisible(false);
          });
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
::v-deep .el-divider--horizontal {
  margin: 12px 0;
}
::v-deep .el-input__inner {
  text-align: left;
}
.month {
  font-size: 18px;
  font-weight: 500;
  padding: 0 0 20px 0;
}
</style>
