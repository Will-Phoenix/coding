<template>
  <el-dialog
    title="修改发票信息"
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
    <el-form ref="form" :model="formData" label-width="150px">
      <el-form-item v-for="item in dataStructure" :label="item.label" :key="item.code" :prop="item.code">
        <el-input v-model="formData[item.code]" placeholder="请输入" maxlength="30" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="buttonLoading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { updateInvoiceInfo } from "@/api/business/pasteTicket";

export default {
  name: 'editInvoice',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    // 发票的字段值,不是发票组，则allData中的object；是发票组，则为map里对应key的value
    data: {
      type: Object,
      default: () => ({})
    },
    // 返回整个发票数据结构，用来编辑
    allData: {
      type: Object,
      default: () => ({})
    },
    // 每种发票对应的字段集
    dataStructure: {
      type: Array,
      default: () => ([])
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
      buttonLoading: false,
    }
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = {};
        this.dataStructure.forEach(v => {
          formData[v.code] = this.data[v.code] || undefined;
        });
        // 把发票id加上和object的主键id
        formData.billId = this.data.billId;
        if (this.data.id) {
          formData.id = this.data.id;
        }
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          // 根据是否是发票组，构建请求数据
          let requestData = {};
          if (this.allData.entity.groupId) {
            // 是发票组，则应该修改的发票数据，放入inners对应的元素中的value里
            requestData = JSON.parse(JSON.stringify(this.allData));
            requestData.inners[requestData.inners.findIndex(v => v.value.billId === this.formData.billId)].value = this.formData;
          } else {
            // 不是发票组
            requestData = { ...this.allData };
            requestData.object = this.formData;
          }
          try {
            updateInvoiceInfo(requestData).then(() => {
              this.$message.success("修改成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } finally {
            this.buttonLoading = false;
          }
        }
      })
    },
    updateVisible(val) {
      this.$refs.form.resetFields();
      this.$emit('update:visible', val)
    }
  }
}
</script>
<style lang="scss" scoped></style>
