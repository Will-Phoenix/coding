<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="150px">
      <el-form-item :label="`是否展示在${text}`">
        <el-radio-group v-model="showInFlag" @input="showInChange">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="2">否</el-radio>
          <el-radio v-if="showCustom" :label="3">自定义</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <conditionConfig v-if="showInFlag === 3" ref="condition" :show-in-pro="formData[showInProStr]" :groups="groups" :row-index="rowIndex" />
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import conditionConfig from "@/components/conditionConfig/index.vue";

export default {
  name: 'showConfigDialog',
  components: { conditionConfig },
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
    // from：1表单 or 2详情
    from: {
      type: Number,
      default: 1,
      validator: (value) => [1, 2].includes(value)
    },
    // 动态表单配置group
    groups: {
      type: Array,
      default: () => ([])
    },
  },
  data() {
    return {
      formData: {},
      rules: {
        [this.showInStr]: [{ required: true, message: '请选择' }],
      },
      showInFlag: 1,
    }
  },
  computed: {
    title() {
      return `配置${this.text}显隐`;
    },
    text() {
      return this.from === 1 ? "表单" : "详情"
    },
    showInProStr() {
      return this.from === 1 ? 'showInFormPro' : 'showInDetailPro';
    },
    showInStr() {
      return this.from === 1 ? 'showInForm' : 'showInDetail';
    },
    showCustom() {
      // 迭代分组下不支持自定义配置
      /* const arr = this.findRowIndex(this.groups, this.data)
      if (arr) {
        const group = this.groups[arr[0]];
        return !(group.iterable && arr.length > 1)
      } */
      return true;
    },
    rowIndex() {
      return this.findRowIndex(this.groups, this.data);
    }
  },
  watch: {
    visible(n) {
      if (n) {
        console.log("Received 'from' value:", this.from);
        const formData = JSON.parse(JSON.stringify(this.data));
        console.log("formData", formData);
        this.formData = formData;
        // 自定义
        if (this.formData[this.showInProStr] && this.formData[this.showInProStr].length > 0) {
          this.showInFlag = 3;
        } else if (this.formData[this.showInStr] === false) {
          this.showInFlag = 2;
        } else {
          this.showInFlag = 1;
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    }
  },
  methods: {
    onConfirm() {
      try {
        if (this.showInFlag === 3) {
          this.formData[this.showInStr] = true;
          this.formData[this.showInProStr] = this.$refs.condition.getShowInPro();
        } else if (this.showInFlag === 2) {
          this.formData[this.showInStr] = false;
          this.formData[this.showInProStr] = [];
        } else {
          this.formData[this.showInStr] = true;
          this.formData[this.showInProStr] = [];
        }
        this.$emit("confirm", this.formData);
        this.updateVisible(false);
      } catch (e) {
        const msg = e.msg || e.message;
        msg && this.$message.warning(msg)
      }
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    showInChange(val) {
      if (val === "自定义") {
        // 如果没有配置条件，即showInFormPro或showInDetailPro为空，则初始化
        if (!this.formData[this.showInProStr]) {
          this.formData[this.showInProStr] = [
            { type: "字段", fieldName: "", compare: "等于", value: "", logic: "并且" }
          ];
        }
      }
    },
    findRowIndex(fullData, row) {
      for (let i = 0; i < fullData.length; i++) {
        const d = fullData[i];
        if (d._X_ROW_KEY === row._X_ROW_KEY) {
          return [i];
        }
        for (let j = 0; d.fields && j < d.fields.length; j++) {
          const f = d.fields[j];
          if (f._X_ROW_KEY === row._X_ROW_KEY) {
            return [i, j];
          }
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped></style>
