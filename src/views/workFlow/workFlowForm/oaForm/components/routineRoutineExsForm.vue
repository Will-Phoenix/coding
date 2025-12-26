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
      <el-form-item label="填表日期" prop="extDate">
        <el-date-picker
          v-model="formData.extDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报销业务" prop="bizType" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
        <el-select v-model="formData.bizType" clearable placeholder="请选择">
          <el-option label="免费邮寄" value="免费邮寄" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item label="报销原因" prop="descInfo">
        <el-input
          type="textarea"
          :rows="3"
          maxlength="20"
          v-model="formData.descInfo"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="情况说明" prop="remark">
        <el-input
          type="textarea"
          :rows="3"
          maxlength="50"
          v-model="formData.remark"
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
// 常规报销单
export default {
  name: 'routineRoutineExsForm',
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
        applyDept: "",
        applyDeptId: "",
        extDate: "",
        bizType: "",
        descInfo: "",
        remark: "",
      },
      rules: {
        applyDeptId: [{ required: true, message: '请选择' }],
        extDate: [{ required: true, message: '请选择' }],
        bizType: [{ required: true, message: '请选择' }],
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
          const detailJson = Object.assign(this.detailJson, { baseInfo: { ...this.formData }});
          editExsOrder({ id: this.data.id, detailJson: JSON.stringify(detailJson) }).then(() => {
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
      this.formData.applyDept = data.fullName;
    },
  }
}
</script>
<style lang="scss" scoped></style>
