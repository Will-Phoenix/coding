<template>
  <el-dialog
    title="配置企业邮箱"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="邮箱类型" prop="emailType">
        <el-select v-model="formData.emailType" placeholder="请选择邮箱类型" style="width: 100%">
          <el-option
            v-for="item in mailboxTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱用户名" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱用户名" />
      </el-form-item>
      <el-form-item label="授权码" prop="password">
        <el-input v-model="formData.password" type="password" placeholder="请输入授权码" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { setMailboxInfo } from "@/api/business/mailboxTicketPool";

export default {
  name: 'setMailbox',
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
        id: '',
        emailType: '', // 邮箱类型，腾讯企业邮箱：tecentEx，QQ邮箱：QQ
        email: '', // 邮箱
        password: '', // 密码
      },
      rules: {
        emailType: [{ required: true, message: '请选择' }],
        email: [{ required: true, message: '请输入' }],
        password: [{ required: true, message: '请输入授权码' }],
      },
      mailboxTypeOptions: [
        { label: "腾讯企业邮箱", value: "tecentEx" },
        { label: "腾讯QQ邮箱", value: "QQ" },
        { label: "126邮箱", value: "126" },
        { label: "163邮箱", value: "163" }
      ],
    }
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
          const params = {
            id: this.formData.id,
            type: 1, // 类型 1、企业邮箱 2 个人邮箱
            emailType: this.formData.emailType,
            email: this.formData.email,
            password: this.formData.password,
          }
          setMailboxInfo(params).then(() => {
            this.$message.success("配置成功");
            this.$emit('confirm');
            this.updateVisible(false);
          })
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
</style>
