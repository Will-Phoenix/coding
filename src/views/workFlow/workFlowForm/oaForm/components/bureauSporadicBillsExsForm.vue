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
      <el-form-item label="表单日期" prop="submitDate">
        <el-date-picker
          v-model="formData.submitDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="项目" prop="projectName">
        <el-input
          maxlength="30"
          v-model="formData.projectName"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="金额" prop="cost">
        <el-input v-model="formData.cost" type="number" placeholder="请输入" min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="用途" prop="descInfo">
        <el-input
          type="textarea"
          :rows="3"
          maxlength="50"
          v-model="formData.descInfo"
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
import { editExsOrder } from "@/api/business/expenseAccount";
import { cashToChinese, formatCash } from "@/utils/format";
// 零星票据报销单
export default {
  name: 'bureauSporadicBillsExsForm',
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
        submitDate: "",
        projectName: "",
        cost: "",
        descInfo: "",
      },
      rules: {
        submitDate: [{ required: true, message: '请选择' }],
        cost: [{ required: true, message: '请输入' }, { validator: this.formValidate(/^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/, '请输入合法的金额(元)'), trigger: 'blur' }],
        descInfo: [{ required: true, message: '请输入' }],
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
        const formData = JSON.parse(this.data.formData.detailJson).baseInfo;
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
          let exsCost = formatCash(this.formData.cost)
          let exsCostCn = cashToChinese(exsCost)
          const detailJson = Object.assign(this.detailJson, { baseInfo: { ...this.formData }});
          editExsOrder({ id: this.data.id, exsCost, exsCostCn, detailJson: JSON.stringify(detailJson) }).then(() => {
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
  }
}
</script>
<style lang="scss" scoped></style>
