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
      <el-form-item label="操作时间" prop="handleTime">
        <el-date-picker
          v-model="formData.handleTime"
          type="datetime"
          placeholder="请选择时间"
          style="width: 100%">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import dayjs from "dayjs"
import { updateTaskOperatorInfo } from "@/api/business/modifyFormAndFlow"

export default {
  name: 'editFlowDialog',
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
    }
  },
  data() {
    return {
      formData: {},
      rules: {
        handleTime: [{ required: true, message: '请选择' }]
      },
      loading: false
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
          this.loading = true;
          const handleTime = dayjs(this.formData.handleTime).format("YYYY-MM-DD HH:mm:ss");
          updateTaskOperatorInfo({ id: this.formData.id, handleTime }).then(() => {
            this.$message.success("操作成功");
            this.updateVisible(false);
            this.$emit("refresh");
          }).finally(() => {
            this.loading = false;
          });
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>
<style lang="scss" scoped></style>
