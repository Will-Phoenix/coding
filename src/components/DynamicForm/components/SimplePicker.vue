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
import { getDicts } from '@/api/common'

export default {
  name: 'SimplePicker',
  mixins: [ComMixin],
  data() {
    return {
      selectOptions: []
    }
  },
  computed: {

  },
  watch: {
    moduleValue(n) {
      this.updateHiddenFields({
        label: this.selectOptions.filter(v => v.value === n)[0].label
      })
    },
    dataDictionary() {
      this.getDictionaryData(this.dataDictionary);
    }
  },
  mounted() {
    if (this.dataDictionary) {
      this.getDictionaryData(this.dataDictionary);
    }
  },
  methods: {
    getDictionaryData(code) {
      getDicts(code).then(res => {
        this.selectOptions = res.data.list.map(v => ({ label: v.fullName, value: v.enCode }));
      });
    }
  }
}
</script>
