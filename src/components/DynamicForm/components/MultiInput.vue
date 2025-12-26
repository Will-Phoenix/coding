<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input type="textarea" v-model="moduleValue" :maxlength="limit" :placeholder="placeholder" :readonly="readonly" rows="4" show-word-limit></el-input>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'MultiInput',
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
