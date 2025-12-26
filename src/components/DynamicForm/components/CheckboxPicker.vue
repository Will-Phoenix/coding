<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-checkbox-group :class="showDirection" v-model="checkList" :disabled="readonly" @change="checkChange">
      <el-checkbox v-for="item in checkOption" :label="item.value">{{ item.label }}</el-checkbox>
    </el-checkbox-group>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { getDicts } from '@/api/common'

export default {
  name: 'CheckboxPicker',
  mixins: [ComMixin],
  data() {
    return {
      // checkOption: [],
      checkList: []
    }
  },
  computed: {
    showDirection() {
      return {
        vertical: this.field.optionDirection === 'vertical'
      }
    },
    checkOption() {
      return this.dataDictionary
        ? this.dataDictionary
          .replaceAll('，', ',')
          .split(",")
          .map(v => ({ label: v, value: v })) : [];
    }
  },
  watch: {
    // dataDictionary() {
    //   this.getDictionaryData(this.dataDictionary);
    // }
  },
  mounted() {
    // if (this.dataDictionary) {
    //   this.getDictionaryData(this.dataDictionary);
    // }
    // 回填数据
    if (this.moduleValue) {
      this.checkList = this.moduleValue.split(this.field.optionSeparator);
    }
  },
  methods: {
    // getDictionaryData(code) {
    //   getDicts(code).then(res => {
    //     this.checkOption = res.data.list.map(v => ({ label: v.fullName, value: v.enCode }));
    //   });
    // },
    checkChange(nVal) {
      this.moduleValue = nVal.join(this.field.optionSeparator);
    }
  }
}
</script>

<style scoped>
.vertical {
  display: flex;
  flex-direction: column;
}
</style>
