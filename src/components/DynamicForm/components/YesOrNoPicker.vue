<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-radio-group v-model="moduleValue" :placeholder="placeholder" :disabled="readonly">
      <el-radio label="是">是</el-radio>
      <el-radio label="否">否</el-radio>
    </el-radio-group>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'YesOrNoPicker',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {

  },
  watch: {},
  mounted() {

  },
  methods: {}
}
</script>
