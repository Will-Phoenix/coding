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
    <el-form ref="form" :model="formData" :rules="rules" label-width="150px">
      <el-form-item label="年" prop="voucherYear">
        <el-date-picker
          v-model="formData.voucherYear"
          type="year"
          placeholder="选择年"
        />
      </el-form-item>
      <el-form-item label="月" prop="voucherMonth">
        <el-input-number v-model="formData.voucherMonth" controls-position="right" :min="1" :max="12" placeholder="请输入月" />
      </el-form-item>
      <el-form-item label="记" prop="voucherNo">
        <el-input v-model="formData.voucherNo" placeholder="请输入记号" clearable maxlength="10" @change="voucherNoChange">
          <template slot="append">号</template>
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { editVoucherNo } from "@/api/business/expenseAccount";
import dayjs from 'dayjs';

export default {
  name: 'accountVoucher',
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
    templateList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      formData: {},
      rules: {
        voucherYear: [{ required: true, message: '请选择' }],
        voucherMonth: [{ required: true, message: '请输入' }],
        voucherNo: [{ required: true, message: '请输入' }],
      },
    }
  },
  computed: {
    title() {
      return this.data.id ? '编辑' : '新增'
    }
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(JSON.stringify(this.data));
        if (!formData.voucherMonth) { formData.voucherMonth = undefined }
        if (formData.voucherYear) { formData.voucherYear = formData.voucherYear + "-12-31 00:00:00" }
        console.log("formData", formData);
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.formData.voucherYear = dayjs(this.formData.voucherYear).format("YYYY");
          editVoucherNo(this.formData).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm', this.formData);
            this.updateVisible(false);
          });
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    voucherNoChange(val) {
      this.formData.voucherNo = Number(val).toString();
    }
  }
}
</script>
<style lang="scss" scoped></style>
