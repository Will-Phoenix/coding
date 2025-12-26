<template>
  <el-form-item
    :label="label"
    v-if="show"
  >
    <div>{{ moduleValue }}</div>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'ShowValue',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    show() {
      return !(this.emptyHideInForm && !this.moduleValue);
    }
  },
  watch: {},
  mounted() {

  },
  methods: {}
}
</script>
