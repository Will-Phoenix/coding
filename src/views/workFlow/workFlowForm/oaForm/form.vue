<template>
  <div class="flow-form" source="src/views/workFlow/workFlowForm/oaForm/ccdTravelApply">
    <!-- <div class="com-title">
      <h1>{{ dataForm.name }}</h1>
    </div> -->
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule">
      <FormOrder :prop-order-id="setting.id" :toolbar-visible="false" title="详情" sub-title="单据详情" />
    </el-form>
  </div>
</template>

<script>
import comMixin from '../mixin';
import FormOrder from '@/views/expenseAccountManage/copy';

export default {
  name: 'commonFormOrder',
  components: { FormOrder },
  mixins: [comMixin],
  data() {
    return {
      dataForm: {},
      dataRule: {},
    }
  },
  methods: {
  },
}
</script>
<style scoped lang="scss">
::v-deep .jv-node .jv-node {
  margin-bottom: 3px;
}
</style>
