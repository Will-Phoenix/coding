<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-time-picker
      v-if="timeType"
      style="width: 100%"
      v-model="moduleValue"
      :format="PCDisplayFormat"
      :value-format="PCValueFormat"
      :placeholder="placeholder"
    />
    <el-date-picker
      v-else
      style="width: 100%"
      v-model="moduleValue"
      :type="dateTypeSupport"
      :format="PCDisplayFormat"
      :value-format="PCValueFormat"
      :placeholder="placeholder"
    />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'DateTimePicker',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    // 目前只支持time，datetime，date三种类型
    timeType() {
      return this.datetimePickerType === 'time';
    },
    dateTypeSupport() {
      if (['date', 'datetime'].includes(this.datetimePickerType)) {
        return this.datetimePickerType;
      } else {
        return 'date';
      }
    },
    PCDisplayFormat() {
      return this.displayFormat.replace("YYYY", "yyyy").replace("DD", "dd");
    },
    PCValueFormat() {
      return this.valueFormat.replace("YYYY", "yyyy").replace("DD", "dd");
    }
  },
  watch: {},
  mounted() {

  },
  methods: {}
}
</script>
