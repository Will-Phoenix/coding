<template>
  <el-dialog
    title="同步记账凭证数据"
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
        <div style="color: #0a50fb">注：默认为当前年、截止当前月</div>
      </el-form-item>
      <el-form-item label="记账年月" prop="voucherYearMonth">
        <el-date-picker
          v-model="formData.voucherYearMonth"
          type="months"
          placeholder="请选择记账年月"
          value-format="yyyy-MM"
          style="width: 100%"
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
import dayjs from 'dayjs';

export default {
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    // 对选择的记账月份是否是同一年进行校验
    const validateIsSameYear = (rule, value, callback) => {
      if (value) {
        // 把选中的时间全部格式化成年
        const newData = value.map(v => dayjs(v).year());
        // 判断所有元素是否是同一年，即是否相等
        const isSame = newData.every(v => v === newData[0]);
        if (isSame) {
          callback();
        } else {
          callback(new Error('所选的记账月份必须是同一年，请重新选择'));
        }
      } else {
        callback();
      }
    };
    return {
      loading: false,
      formData: {
        voucherYearMonth: []
      },
      rules: {
        voucherYearMonth: [
          { required: true, message: '请选择' },
          { validator: validateIsSameYear, trigger: "blur" }
        ]
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 塞入默认年月，按照当前月为截止
        const month = dayjs().month();
        const data = [];
        for (let i = 0; i <= month; i++) {
          if (i + 1 < 10) {
            data.push(`${dayjs().year()}-0${i + 1}`);
          } else {
            data.push(`${dayjs().year()}-${i + 1}`);
          }
        }
        // 当前的数据格式["2024-04", "2024-03"]
        this.formData.voucherYearMonth = data;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
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
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped></style>
