<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-cascader
      style="width: 100%"
      ref="cascader"
      v-model="value"
      :options="areaTree"
      :placeholder="placeholder"
      :disabled="readonly"
      clearable
      filterable
      @change="cascaderChange"
    />
    <travelAssistantBar v-if="showAssistantBar" :type="type" :data="assistantData" />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { getProvinceList } from '@/api/system/province'
import { mapGetters } from "vuex";
import travelAssistantBar from "@/views/approvalCenter/components/travelAssistantBar.vue";

export default {
  name: 'CommonCascader',
  components: { travelAssistantBar },
  mixins: [ComMixin],
  data() {
    return {
      props: {
        lazy: true,
        expandTrigger: 'hover',
        checkStrictly: false,
        lazyLoad(node, resolve) {
          // 调用接口取数据
          getProvinceList(node.value || -1).then(res => {
            const nodes = res.data.list.map(item => ({
              label: item.fullName,
              value: item.id,
              leaf: node.level >= 2
            }));
            resolve(nodes)
          })
        }
      },
      value: []
    }
  },
  computed: {
    ...mapGetters(['areaTree']),
    showAssistantBar() {
      // 勾选了“智能差旅助手”的出差申请单，展示在字段设置为dest的地区三级组件下
      return this.appFormConf.relTravelAssist && this.field.fieldName === "dest" && this.appFormConf.orderType == "1";
    },
    type() {
      return this.appFormConf.formType.toString();
    },
    assistantData() {
      return {
        userIds: this.getValueFromCurrentGroup("travelUserIds"),
        areaIds: this.getValueFromCurrentGroup("dest")
      };
    }
  },
  created() {
    if (this.areaTree.length === 0) {
      this.$store.dispatch('generator/getAreaTree');
    }
  },
  watch: {
    moduleValue() {
      const node = this.$refs.cascader.getCheckedNodes();
      console.log("联级选中节点：", node);
      this.updateHiddenFields({
        provCode: node[0].path[0],
        cityCode: node[0].path[1],
        distCode: node[0].path[2],
        provName: node[0].pathLabels[0],
        cityName: node[0].pathLabels[1],
        distName: node[0].pathLabels[2],
        fullName: node[0].pathLabels.join("/")
      });
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.moduleValue) {
        this.value = this.moduleValue.split(",");
      }
    },
    updateData(v) {
      if (v && v.length > 0) {
        this.moduleValue = v.join(",");
      }
    },
    cascaderChange(v) {
      this.updateData(v);
    }
  }
}
</script>
