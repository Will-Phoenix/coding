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
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入" clearable maxlength="16" />
      </el-form-item>
      <el-form-item label="关联流程节点" prop="nodeCode">
        <el-select v-model="formData.nodeCode" placeholder="请选择" clearable multiple>
          <el-option v-for="item in flowList" :key="item.nodeCode" :label="item.nodeTitle" :value="item.nodeCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联印章" prop="signSealId">
        <el-select v-model="formData.signSealId" placeholder="请选择" clearable>
          <el-option v-for="item in stampList" :key="item.value" :label="item.label" :value="item.value" />
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

// 关联用印和流程
export default {
  name: 'StampRefDialog',
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
    flowList: {
      type: Array,
      default: () => []
    },
    stampList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      formData: {},
      rules: {
        name: [{ required: true, message: '请输入' }],
        nodeCode: [{ required: true, message: '请选择' }],
        signSealId: [{ required: true, message: '请选择' }],
      }
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
        if (formData.nodeCode) {
          formData.nodeCode = formData.nodeCode.split(",");
        }
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
          // 流程名称nodeTitle返回，用于回显（之前是请求接口中有nodeTitle，现在需要自己塞入nodeTitle）
          const nodeTitleList = [];
          this.formData.nodeCode.forEach(r => {
            nodeTitleList.push(this.flowList.filter(v => v.nodeCode == r)[0].nodeTitle);
          });
          const nodeTitle = nodeTitleList.join(",");
          const signSealName = this.stampList.filter(v => v.value == this.formData.signSealId)[0].label;
          this.$emit('update:value', { ...this.formData, nodeTitle, signSealName });
          this.$emit('confirm', { ...this.formData, nodeTitle, signSealName });
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
