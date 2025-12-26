<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <DepSelect
      v-model="value"
      :placeholder="placeholder"
      :disabled="readonly"
      :multiple="multiple"
      :multiple-limit="limit"
      @change="deptChange"
      select-type="all"
      clearable
    />
  </el-form-item></template>
<script>
import ComMixin from './comMixin'
import { mapGetters } from "vuex";

export default {
  name: 'DeptSelects',
  mixins: [ComMixin],
  data() {
    return {
      value: ""
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    multiple() {
      return this.limit > 1;
    }
  },
  watch: {
    moduleValue(val) {
      if (val) {
        if (this.multiple) {
          this.value = val.split(",");
        } else {
          this.value = val;
        }
      }
    }
  },
  created() {

  },
  mounted() {
    // 回填数据
    if (this.moduleValue) {
      if (this.multiple) {
        this.value = this.moduleValue.split(",");
      } else {
        this.value = this.moduleValue;
      }
    } else {
      // 自动带入姓名信息, 默认自动带入
      if (this.defaultInsert !== false) {
        let ids;
        let deptData;
        if (this.multiple) {
          ids = [this.userInfo.departmentId];
          deptData = [{ fullName: this.userInfo.departmentName }];
        } else {
          ids = this.userInfo.departmentId;
          deptData = { fullName: this.userInfo.departmentName };
        }
        this.deptChange(ids, deptData);
      }
    }
  },
  methods: {
    deptChange(ids, selectedData) {
      console.log("部门ids：", ids);
      console.log("部门节点：", selectedData);
      if (this.multiple) {
        // 多选：ids和 selectedData为数组
        this.moduleValue = ids.join(",");
        // 设置隐藏字段
        this.updateHiddenFields({
          deptName: selectedData.map(v => v.fullName).join(",")
        });
      } else {
        // 多选：ids为字符串，selectedData为对象
        this.moduleValue = ids;
        // 设置隐藏字段
        this.updateHiddenFields({
          deptName: selectedData.fullName
        });
      }
    }
  }
}
</script>
