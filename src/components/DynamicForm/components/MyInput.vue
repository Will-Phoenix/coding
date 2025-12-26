<template>
  <el-form-item
    v-if="showInFormCalc"
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input v-model="moduleValue" :maxlength="limit" :placeholder="placeholder" :readonly="readonly"></el-input>
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { mapGetters } from "vuex";

export default {
  name: 'MyInput',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    showInFormCalc() {
      let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + this.field.fieldName;
      if (this.group.iterable) {
        keyName += '.' + this.groupIterateIndex;
      }
      return !(keyName && !this.fieldVisibleMap.get(keyName));
    }
  },
  watch: {},
  mounted() {
    if (this.defaultInsertPhone) {
      this.insertPhone();
    }
    if (!this.moduleValue && this.defaultValue) {
      this.moduleValue = this.defaultValue;
    }
  },
  methods: {
    insertPhone() {
      if (!this.moduleValue && this.userInfo.mobilePhone) {
        this.moduleValue = this.userInfo.mobilePhone;
      }
    }
  }
}
</script>
