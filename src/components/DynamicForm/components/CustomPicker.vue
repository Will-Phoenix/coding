<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-select v-model="moduleValue" :placeholder="placeholder" :disabled="readonly" :multiple="false" clearable filterable>
      <el-option
        v-for="item in selectOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'CustomPicker',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    selectOptions() {
      return this.dataDictionary ? this.dataDictionary.split(",").map(v => ({ label: v, value: v })) : [];
    }
  },
  watch: {

  },
  mounted() {

  },
  methods: {

  }
}
</script>
