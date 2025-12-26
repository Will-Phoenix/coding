<template>
  <el-dialog
    title="批量打印"
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
      <el-form-item>
        <div style="color: #0a50fb">注：默认为当前年月</div>
      </el-form-item>
      <el-form-item label="打印年月" prop="voucherYearMonth">
        <el-date-picker
          v-model="formData.voucherYearMonth"
          type="month"
          placeholder="请选择要打印年月"
          value-format="yyyy-MM"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{
        $t("common.cancelButton")
      }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{
        $t("common.confirmButton")
      }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import dayjs from "dayjs";

export default {
  model: {
    prop: "visible",
    event: "update:visible"
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      formData: {
        voucherYearMonth: []
      },
      rules: {
        voucherYearMonth: [{ required: true, message: "请选择" }]
      }
    };
  },
  watch: {
    visible(n) {
      if (n) {
        // 塞入默认当前年月
        // 当前的数据格式2024-6
        if (dayjs().month() + 1 < 10) {
          this.formData.voucherYearMonth = `${dayjs().year()}-0${dayjs().month() +
            1}`;
        } else {
          this.formData.voucherYearMonth = `${dayjs().year()}-${dayjs().month() +
            1}`;
        }
        this.$nextTick(
          () => this.$refs.form && this.$refs.form.clearValidate()
        );
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.loading = true;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit("confirm", this.formData);
          this.updateVisible(false);
          this.loading = false;
        } else {
          this.loading = false;
        }
      });
    },
    updateVisible(val) {
      this.$emit("update:visible", val);
    }
  }
};
</script>
<style lang="scss" scoped></style>
