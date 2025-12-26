<template>
  <el-dialog
    :title="title"
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
      <el-form-item label="申请科室" prop="applyDeptId">
        <DepSelect
          v-model="formData.applyDeptId"
          placeholder="请选择"
          select-type="org"
          clearable
          @change="onDeptSelectChange"
        />
      </el-form-item>
      <el-form-item label="填表日期" prop="writeTime">
        <el-date-picker
          v-model="formData.writeTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="现金支付项目" prop="project">
        <el-input
          maxlength="150"
          v-model="formData.project"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="科目" prop="subject">
        <el-input
          maxlength="150"
          v-model="formData.subject"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="单位预算代码" prop="budgetCode">
        <el-input
          maxlength="150"
          v-model="formData.budgetCode"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="用途" prop="use">
        <el-input
          maxlength="150"
          v-model="formData.use"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="现金支付金额" prop="payAmount">
        <el-input v-model="formData.payAmount" type="number" placeholder="请输入" min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="情况说明" prop="desc">
        <el-input
          type="textarea"
          :rows="3"
          maxlength="250"
          v-model="formData.desc"
          placeholder="请输入"
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
import { editApplyOrder } from "@/api/business/expenseAccount";
import { cashToChinese, formatCash } from "@/utils/format";
// 现金支付情况说明表单
export default {
  name: 'bureauCashPaymentForm',
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
  },
  data() {
    return {
      loading: false,
      detailJson: {}, // 这个是整个detailJson，要接收到，我们只改其中travelInfo部分
      formData: {
        applyDeptName: "",
        applyDeptId: "",
        writeTime: "",
        project: "",
        subject: "",
        budgetCode: "",
        use: "",
        payAmount: "",
        desc: "",
      },
      rules: {
        applyDeptId: [{ required: true, message: '请选择' }],
        writeTime: [{ required: true, message: '请选择' }],
        project: [{ required: true, message: '请输入' }],
        use: [{ required: true, message: '请输入' }],
        payAmount: [{ required: true, message: '请输入' }, { validator: this.formValidate(/^(([1-9]\d*)|(0))(\.\d{1,2})?$/, '请输入合法的金额(元)'), trigger: 'blur' }],
      },
    }
  },
  computed: {
    title() {
      return '修改表单';
    },
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(this.data.formData.detailJson);
        this.detailJson = JSON.parse(this.data.formData.detailJson);
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.$refs.form.resetFields();
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          let amount = formatCash(this.formData.payAmount)
          let amountCn = cashToChinese(amount)
          const detailJson = Object.assign(this.detailJson, { ...this.formData });
          editApplyOrder({ id: this.data.id, amount, amountCn, detailJson: JSON.stringify(detailJson) }).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm');
            this.updateVisible(false);
          });
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    onDeptSelectChange(ids, data) {
      this.formData.applyDeptName = data.fullName;
    },
  }
}
</script>
<style lang="scss" scoped></style>
