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
    <el-form ref="form" :model="formData" :rules="rules" label-width="135px">
      <el-form-item label="申请科室" prop="applyDeptId">
        <DepSelect
          v-model="formData.applyDeptId"
          placeholder="请选择"
          select-type="org"
          clearable
          @change="applyDeptIdChange"
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
      <el-form-item label="事由" prop="cause">
        <el-input v-model="formData.cause" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <el-form-item label="拟接待人数" prop="receptionPersonNum">
        <el-input-number :min="0" :max="10000000000" v-model="formData.receptionPersonNum" controls-position="right" placeholder="请输入" style="width: 100%" />
      </el-form-item>
      <el-form-item label="拟陪客人数" prop="toReceptionNum">
        <el-input-number :min="0" :max="10000000000" v-model="formData.toReceptionNum" controls-position="right" placeholder="请输入" style="width: 100%" />
      </el-form-item>
      <el-form-item label="拟陪客人姓名" prop="toReceptionUsersName">
        <el-input v-model="formData.toReceptionUsersName" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <el-form-item label="费用预算（住宿、餐费、会议室租用等）" prop="budget">
        <el-input v-model="formData.budget" placeholder="请输入" maxlength="150" />
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

export default {
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
      formData: {},
      rules: {
        applyDeptId: [{ required: true, message: '请选择' }],
        writeTime: [{ required: true, message: '请选择' }],
        cause: [{ required: true, message: '请输入' }],
        receptionPersonNum: [{ required: true, message: '请输入' }],
        toReceptionNum: [{ required: true, message: '请输入' }],
        toReceptionUsersName: [{ required: true, message: '请输入' }],
        budget: [{ required: true, message: '请输入' }],
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
        console.log("formData", formData);
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
          // 把陪客人数和陪客人拼接起来
          this.formData.toReceptionUsers = `${this.formData.toReceptionUsersName} ${this.formData.toReceptionNum}人`;
          editApplyOrder({ id: this.data.id, detailJson: JSON.stringify({ ...this.formData }) }).then(() => {
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
    applyDeptIdChange(value, selected) {
      this.$nextTick(() => {
        this.formData.applyDeptName = selected.fullName;
      });
    },
  }
}
</script>
<style lang="scss" scoped></style>
