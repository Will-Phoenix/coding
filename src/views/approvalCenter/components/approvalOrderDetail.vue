<template>
  <el-dialog
    title="审批单详情"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="522px"
    :modal-append-to-body="false"
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content" v-loading="listLoading">
      <div class="template-container">
        <el-image class="small" v-if="applyTemplateInfo.url" :src="applyTemplateInfo.url" :preview-src-list="[applyTemplateInfo.url]" />
        <i v-else class="el-icon-loading"></i>
      </div>
      <el-tabs v-model="active">
        <el-tab-pane label="申请单" name="0">
          <AnyFormDetail v-if="id" :key="id" @load="onLoadApplyOrderInfo" :id="id" />
        </el-tab-pane>
        <el-tab-pane label="审批流程" name="1">
          <FlowTaskNodeList
            class="flow-task-node-list"
            v-if="info && info.flowTaskNodeList"
            v-bind="info"
            :flow-task-node-list="info.flowTaskNodeList"
            :flow-task-operator-record-list="info.flowTaskOperatorRecordList"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script>

import AnyFormDetail from "@/components/AnyFormDetail/index.vue";
import FlowTaskNodeList from "@/components/FlowTaskNodeList/index.vue";
import baseMixin from "@/mixins/print/baseMixin";

export default {
  name: 'approvalOrderDetail',
  components: { FlowTaskNodeList, AnyFormDetail },
  mixins: [baseMixin],
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      listLoading: false,
      applyTemplateInfo: {},
      info: {},
      active: '0'
    }
  },
  computed: {
    id() {
      return this.data?.id || ''
    }
  },
  watch: {
    id(n) {
      if (n) {
        this.applyTemplateInfo = {};
      }
    }
  },
  methods: {
    async onLoadApplyOrderInfo(info) {
      console.log('approvalOrderDetail===onLoadApplyOrderInfo', info);
      this.listLoading = false;
      this.info = { ... info[this.id] };
      const formData = this.info.formData;
      this.applyTemplateInfo = {};
      const result = await this.templateToImageDirectly(formData.basePrintdevId, formData.id, formData.orderType);
      this.applyTemplateInfo = {
        url: result.url,
        src: result.src,
        title: formData.name,
      }
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px 22px 0 20px !important;
}
.dialog-content {
  padding-bottom: 20px;
  overflow: auto;
  ::v-deep .el-tabs__nav-wrap::after {
    height: 0;
  }
}
.template-container {
  height: 350px;
  margin-bottom: 10px;
  border: 1px solid #edf1f2;
  border-radius: 12px;
  width: 100%;
  padding: 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .small {
    height: 340px;
    width: auto;
  }
}
.flow-task-node-list {
  width: 100%;
  padding: 16px 16px 0 16px;
  border: 1px solid #edf1f2;
  border-radius: 12px;
}
</style>
