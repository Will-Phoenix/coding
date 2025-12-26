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
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入" clearable maxlength="16" />
      </el-form-item>
      <el-form-item label="签名类型" prop="signType">
        <el-select v-model="formData.signType" placeholder="请选择" clearable @change="signTypeChange">
          <el-option v-for="item in signTypeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.signType === 3" label="每行签名个数" prop="signGroupRow">
        <el-input-number v-model="formData.signGroupRow" controls-position="right" placeholder="请输入" :min="1" clearable style="width: 100%" />
      </el-form-item>
      <el-form-item v-if="formData.signType !== 3" label="是否展示签名意见" prop="showOpinion">
        <el-select v-model="formData.showOpinion" placeholder="请选择" clearable>
          <el-option v-for="item in showOpinionList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联流程节点" prop="nodeCode">
        <el-select v-model="formData.nodeCode" placeholder="请选择" clearable multiple>
          <el-option v-for="item in currentFlowList" :key="item.nodeCode" :label="item.nodeTitle" :value="item.nodeCode" />
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

// 关联签名
export default {
  name: 'SignRefDialog',
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
  },
  data() {
    return {
      formData: {},
      rules: {
        name: [{ required: true, message: '请输入' }],
        signType: [{ required: true, message: '请选择' }],
        nodeCode: [{ required: true, message: '请选择' }],
        showOpinion: [{ required: true, message: '请选择' }],
        signGroupRow: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
      signTypeList: [
        { label: "手写签名", value: 1 },
        { label: "系统签名", value: 2 },
        { label: "手写签名组", value: 3 }
      ],
      showOpinionList: [
        { label: "是", value: "1" },
        { label: "否", value: "0" }
      ]
    }
  },
  computed: {
    title() {
      return this.data.id ? '编辑' : '新增'
    },
    currentFlowList() {
      return this.flowList.filter(v => {
        if ([1, 2].includes(this.formData.signType)) {
          return v.counterSign === 0;
        } else if (this.formData.signType === 3) {
          return [1, 2].includes(v.counterSign);
        } else {
          return false;
        }
      });
    }
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(JSON.stringify(this.data));
        if (formData.nodeCode) {
          formData.nodeCode = formData.nodeCode.split(",");
        } else {
          Object.assign(formData, { showOpinion: "0", signType: 1 })
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
          this.$emit('update:value', { ...this.formData, nodeTitle })
          this.$emit('confirm', { ...this.formData, nodeTitle })
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    signTypeChange(val) {
      if ([1, 2].includes(val)) {
        this.formData.signGroupRow = "";
      } else if (val === 3) {
        this.formData.showOpinion = "0";
      }
      this.formData.nodeCode = "";
    }
  }
}
</script>
<style lang="scss" scoped></style>
