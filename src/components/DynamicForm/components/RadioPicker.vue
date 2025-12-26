<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-radio-group v-model="moduleValue" :placeholder="placeholder" :disabled="readonly">
      <el-radio v-for="item in radioOption" :label="item.value">{{ item.label }}</el-radio>
    </el-radio-group>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { getDicts } from '@/api/common'

export default {
  name: 'RadioPicker',
  mixins: [ComMixin],
  data() {
    return {
      radioOption: []
    }
  },
  computed: {

  },
  watch: {
    moduleValue(n) {
      this.updateHiddenFields({
        label: this.radioOption.filter(v => v.value === n)[0].label
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
        this.radioOption = res.data.list.map(v => ({ label: v.fullName, value: v.enCode }));
      });
    }
  }
}
</script>
