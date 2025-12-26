<template>
  <el-dialog
    title="批量上传银行回执单"
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
    <div style="color: red;margin-bottom: 20px">注：银行回执单/国库支付单：样式需要为一式一栏，即一页pdf只能有一张回执单</div>
    <el-form ref="form" :model="formData" :rules="rules" label-width="150px">
      <el-form-item label="报销单月份" prop="month">
        <el-date-picker
          v-model="formData.month"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          value-format="yyyy-MM"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报销单类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="银行回执单文件" prop="fileList">
        <el-upload
          :action="actionUrl"
          :headers="uploadHeaders"
          multiple
          :file-list="formData.fileList"
          :on-success="handleSuccess"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { orderTypeSelect } from "@/api/business/expenseAccount";

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
    return {
      loading: false,
      formData: {
        month: "",
        type: null,
        fileList: []
      },
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      rules: {
        month: [
          { required: true, message: '请选择' }
        ],
        fileList: [
          { required: true, message: '请选择' }
        ],
      },
      typeOptions: [{ label: "全部", value: null }]
    }
  },
  created() {
    // 加载报销单类型
    orderTypeSelect({ type: 2, status: 1 }).then(res => {
      this.typeOptions.push(...res.data.map(v => ({ label: v.name, value: v.id })));
    });
  },
  watch: {
    visible(n) {
      if (n) {
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = { month: "", type: null, fileList: [] };
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.loading = true;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit("confirm", {
            startMonth: this.formData.month[0] + "-01",
            endMonth: this.formData.month[1] + "-31",
            type: this.formData.type,
            files: this.formData.fileList.map(v => v.response.data.id).join(",")
          });
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
    handleSuccess(response, file, fileList) {
      this.formData.fileList = fileList;
      this.$refs.form.validateField("fileList");
    }
  }
}
</script>
<style lang="scss" scoped></style>
