<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-cascader
      style="width: 100%"
      ref="cascader"
      v-model="value"
      :options="options"
      :props="props"
      :placeholder="placeholder"
      :disabled="readonly"
      clearable
      filterable
      @change="cascaderChange"
    />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { getDicts } from '@/api/common'

export default {
  name: 'CommonCascader',
  mixins: [ComMixin],
  data() {
    return {
      options: [],
      props: {
        label: "fullName",
        value: "enCode"
      },
      value: []
    }
  },
  computed: {

  },
  watch: {
    moduleValue() {
      const node = this.$refs.cascader.getCheckedNodes();
      console.log("二联级选中节点：", node);
      this.updateHiddenFields({
        id1: node[0].path[0],
        name1: node[0].pathLabels[0],
        id2: node[0].path[1],
        name2: node[0].pathLabels[1],
        names: node[0].pathLabels.join("/")
      });
    },
    dataDictionary() {
      this.getDictionaryData(this.dataDictionary);
    }
  },
  mounted() {
    if (this.dataDictionary) {
      this.getDictionaryData(this.dataDictionary);
    }
    this.init();
  },
  methods: {
    getDictionaryData(code) {
      getDicts(code).then(res => {
        this.options = res.data.list;
      });
    },
    init() {
      if (this.moduleValue) {
        this.value = this.moduleValue.split(",");
      }
    },
    updateData(v) {
      if (v && v.length === 2) {
        this.moduleValue = v.join(",");
      }
    },
    cascaderChange(v) {
      this.updateData(v);
    }
  }
}
</script>
