<template>
  <div class="flow-form">
    <!-- <div class="com-title">
      <h1>{{ dataForm.name }}</h1>
    </div> -->
    <el-button v-if="showButton" type="primary" @click="openForm" style="margin-left:10px">修改表单</el-button>
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule">
      <FormOrder v-if="updateEnd" :prop-order-id="setting.id" :toolbar-visible="false" title="详情" sub-title="单据详情" />
    </el-form>
    <routineRoutineExsForm :visible.sync="formDialog.visible" :data="formDialog.data" @confirm="updateFormData()" />
  </div>
</template>

<script>
import comMixin from '../mixin';
import FormOrder from '@/views/expenseAccountManage/copy';
import routineRoutineExsForm from "./components/routineRoutineExsForm.vue";
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";

export default {
  components: { FormOrder, routineRoutineExsForm },
  mixins: [comMixin],
  data() {
    return {
      dataForm: {},
      dataRule: {},
      formDialog: {
        visible: false,
        data: {},
      },
      updateEnd: true,
    }
  },
  computed: {
    showButton() {
      if (this.setting.id) {
        return this.setting.opType == 1;
      } else {
        return false;
      }
    },
  },
  methods: {
    openForm() {
      Object.assign(this.formDialog, { visible: true, data: this.setting || {}})
    },
    updateFormData() {
      this.updateEnd = false;
      FlowBeforeInfo(this.setting.id).then(res => {
        this.setting.formData = res.data.formData;
        this.updateEnd = true;
      });
    },
  },
}
</script>
<style scoped lang="scss">
::v-deep .jv-node .jv-node {
  margin-bottom: 3px;
}
</style>
