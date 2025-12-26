<template>
  <el-form-item
    v-show="componentShow"
    :prop="fieldName"
    :label="label"
    :rules="componentShow ? rules : []"
  >
    <DudgetSelect
      v-model="value"
      :placeholder="placeholder"
      :disabled="readonly"
      :multiple="multiple"
      :multiple-limit="limit"
      @change="deptChange"
      @componentShow="componentShow = $event"
      clearable
    />
  </el-form-item></template>
<script>
import ComMixin from './comMixin'
import DudgetSelect from '@/components/Generator/components/budgetSelect/index.vue'

export default {
  name: 'BudgetSelects',
  components: { DudgetSelect },
  mixins: [ComMixin],
  data() {
    return {
      value: "",
      // 注意：该字段决定是否显示当前组件：就算配置了预算组件，但是如果当前用户所在部门没有预算，则不展示
      // 因此通过@componentShow返回第一次加载预算时，是否有数据
      componentShow: false
    }
  },
  computed: {
    multiple() {
      return this.limit > 1;
    }
  },
  watch: {

  },
  created() {

  },
  mounted() {
    // 回填数据
    if (this.moduleValue) {
      if (this.multiple) {
        this.value = this.moduleValue.split(",");
      } else {
        this.value = this.moduleValue;
      }
    }
  },
  methods: {
    deptChange(ids, selectedData) {
      console.log("预算ids：", ids);
      console.log("预算节点：", selectedData);
      if (this.multiple) {
        // 多选：ids和 selectedData为数组
        this.moduleValue = ids.join(",");
        // 设置隐藏字段
        this.updateHiddenFields({
          budgetName: selectedData.map(v => v.name).join(","),
          sourceName: selectedData.filter(v => !!v.label).map(v => v.label).join(","),
          sourceId: selectedData.filter(v => !!v.labelId).map(v => v.labelId).join(",")
        });
      } else {
        // 多选：ids为字符串，selectedData为对象
        this.moduleValue = ids;
        // 设置隐藏字段
        this.updateHiddenFields({
          budgetName: selectedData.name,
          sourceName: selectedData.label,
          sourceId: selectedData.labelId
        });
      }
    }
  }
}
</script>
