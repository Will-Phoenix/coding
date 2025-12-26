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
      <el-form-item label="附件打印模版名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入" clearable maxlength="30" />
      </el-form-item>
      <el-form-item label="请选择打印模版" prop="basePrintdevId">
        <el-select v-model="formData.basePrintdevId" clearable filterable placeholder="请选择">
          <el-option v-for="item in templateList" :key="item.id" :label="item.fullName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="模版类型" prop="additionType">
        <el-select v-model="formData.additionType" clearable filterable placeholder="请选择">
          <el-option v-for="item in additionTypeOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>

export default {
  name: 'templateRefDialog',
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
        name: [{ required: true, message: '请输入' }],
        basePrintdevId: [{ required: true, message: '请选择' }],
        additionType: [{ required: true, message: '请选择' }],
      },
      additionTypeOption: [
        { label: "自定义", value: 0 },
        { label: "发票打印", value: 1 }
      ],
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
          this.$emit('update:value', this.formData)
          this.$emit('confirm', this.formData)
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
