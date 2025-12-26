<template>
  <div>
    <div class="template-container">
      <el-image class="small" v-if="templateInfo.url" :src="templateInfo.url" :preview-src-list="[templateInfo.url]" />
      <i v-else class="el-icon-loading"></i>
    </div>
    <flow-task-node-list class="flow-task-node-list" v-if="orderInfo && orderInfo.flowTaskNodeList" :flow-task-node-list="orderInfo.flowTaskNodeList" :flow-task-operator-record-list="orderInfo.flowTaskOperatorRecordList" :circulate-user-name="orderInfo.circulateUserName" :is-select="true" :on-candidate-list-change="onCandidateListChange" />
  </div>
</template>
<script>

import baseMixin from "@/mixins/print/baseMixin";
import FlowTaskNodeList from "@/components/FlowTaskNodeList/index.vue";

export default {
  name: 'confirmOrder',
  components: { FlowTaskNodeList },
  mixins: [baseMixin],
  props: {
    orderInfo: {
      type: Object,
      default: undefined
    },
  },
  data() {
    return {
      templateInfo: {
        url: '',
      }
    }
  },
  computed: {

  },
  watch: {
    orderInfo: {
      handler(n) {
        if (n?.formData?.id) { // 检查关键数据是否存在
          this.loadTemplateInfo();
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadTemplateInfo() {
      let data = this.orderInfo.formData;
      const result = await this.templateToImageDirectly(data.basePrintdevId, data.id, data.orderType, "");
      this.templateInfo.url = result.url;
    },
    onCandidateListChange(val1, val2) {
      this.$emit('change', { finished: val1, list: val2 });
    }
  }
}
</script>
<style lang="scss" scoped>
.template-container {
  margin: 20px 0;
  border: 1px solid #edf1f2;
  height: 710px;
  display: flex;
  justify-content: center;
  align-items: center;

  .small {
    height: 708px;
    width: auto;
  }
}
.flow-task-node-list {
  background: #FCFCFC;
  border-radius: 8px;
  border: 1px solid #DDDDDD;
  padding: 30px 40px 10px 40px;
}
</style>
