<template>
  <el-cascader
    ref="cascader"
    :props="props"
    :value="value1"
    @change="changeValue"
    style="width: 100%"
  />
</template>

<script>
import { getProvinceList } from '@/api/system/province';

export default {
  model: {
    prop: "value1",
    event: "update:value1",
  },
  props: ["value1"],
  data() {
    return {
      props: {
        lazy: true,
        lazyLoad(node, resolve) {
          if (node.level === 0) {
            getProvinceList(-1).then(res => {
              resolve(res.data.list);
            });
          } else {
            getProvinceList(node.value).then(res => {
              if (node.level === 2) {
                res.data.list.forEach(v => v.isLeaf = true);
              }
              resolve(res.data.list);
            });
          }
        },
        label: "fullName",
        value: "id",
        leaf: "isLeaf",
      },
      // options: [],
    }
  },
  methods: {
    changeValue(val) {
      this.$emit("update:value1", val);
      this.$emit("allPathLabel", this.getAllPathLabel())
    },
    // 返回选中的各节点的label
    getAllPathLabel() {
      const allPath = this.$refs.cascader.getCheckedNodes()[0];
      const labelList = [];
      function f(data) {
        labelList.unshift(data.label);
        if (data.parent) {
          f(data.parent);
        }
      }
      f(allPath);
      console.log("labelList", labelList);
      return labelList;
    },
  },
}
</script>
