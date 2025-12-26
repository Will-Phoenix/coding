<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input-number style="width: 100%" v-model="moduleValue" controls-position="right" :max="maxValue" :placeholder="placeholder" :readonly="readonly"></el-input-number>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'NumberInput',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    maxValue() {
      let max = ''
      for (let i = 0; i < this.limit; i++) {
        max += '9'
      }
      return max * 1
    },
    rules() {
      return [
        {
          validator: this.validateNumber,
          trigger: 'change',
          required: !!this.required
        }
      ]
    }
  },
  watch: {},
  mounted() {
    if (!this.moduleValue && this.defaultValue) {
      this.moduleValue = this.defaultValue;
    }
  },
  methods: {
    validateNumber(rule, value, callback) {
      if (value === '' || value == null) {
        if (this.required) {
          callback(new Error(this.requiredMessage));
        } else {
          callback();
        }
      } else if (value.toString().length > this.limit) {
        callback(new Error('限制长度' + this.limit + '位'));
      } else {
        callback();
      }
    }
  }
}
</script>
