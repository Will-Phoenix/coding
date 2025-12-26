<template>
  <div>
    <MyGroup
      v-for="(item,index) in formList"
      :key="item.__key"
      :detail-json="detailJson"
      :group-iterate-index="index"
      :group="group"
      :app-form-conf="appFormConf"
      :enter-from="enterFrom"
      :field-visible-map="fieldVisibleMap"
      @del="onDel"
    />
    <div v-if="showInFormCalc && formList.length < limit" class="add-t">
      <el-button @click="onAdd">添加{{ group.label }}</el-button>
    </div>
  </div>
</template>
<script>
import { toInt } from '@/utils/format'
import MyGroup from './MyGroup.vue'

export default {
  name: 'IterateGroup',
  components: { MyGroup },
  props: {
    appFormConf: {
      type: Object,
      required: true
    },
    group: {
      type: Object,
      required: true
    },
    detailJson: {
      type: Object,
      required: true
    },
    enterFrom: {
      type: String,
      default: ""
    },
    fieldVisibleMap: {
      type: Map,
      default: {},
    }
  },
  data() {
    return {
    }
  },
  computed: {
    formList() {
      return this.detailJson[this.group.fieldName] || [];
    },
    limit() {
      return Math.max(toInt(this.group.limit, 1), 1)
    },
    showInFormCalc() {
      return !(this.group.fieldName && !this.fieldVisibleMap.get(this.group.fieldName));
    }
  },
  watch: {
  },
  mounted() {

  },
  methods: {
    onAdd() {
      this.$emit("add", this.group);
    },
    onDel(index) {
      this.$emit("del", this.group, index);
    }
  }
}
</script>
<style lang="scss" scoped>
.add-t {
  text-align: center;
  margin-bottom: 16px;
}
</style>
