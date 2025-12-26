<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <userSelect
      v-model="value"
      :placeholder="placeholder"
      :disabled="readonly"
      :parent-id="parentId"
      :multiple="multiple"
      :multiple-limit="limit"
      @change="userChange"
      clearable
    />
  </el-form-item></template>
<script>
import ComMixin from './comMixin'
import { mapGetters } from "vuex";
import { getOrganizeList } from '@/api/permission/organize.js'

export default {
  name: 'UserSelects',
  mixins: [ComMixin],
  data() {
    return {
      parentId: "0",
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
    this.getParentId();
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
        let userData;
        if (this.multiple) {
          ids = [this.userInfo.userId];
          userData = [{ fullName: this.userInfo.userName }];
        } else {
          ids = this.userInfo.userId;
          userData = { fullName: this.userInfo.userName };
        }
        this.userChange(ids, userData);
      }
    }
  },
  methods: {
    userChange(ids, selectedData) {
      console.log("人员ids：", ids);
      console.log("人员节点：", selectedData);
      if (this.multiple) {
        // 多选：ids和 selectedData为数组
        this.moduleValue = ids && ids.length > 0 ? ids.join(",") : '';
        // 设置隐藏字段
        this.updateHiddenFields({
          userName: selectedData && selectedData.length > 0 ? selectedData.map(v => v.fullName.split("/")[0]).join(",") : ''
        });
      } else {
        // 多选：ids为字符串，selectedData为对象
        this.moduleValue = ids;
        // 设置隐藏字段
        this.updateHiddenFields({
          userName: selectedData.fullName ? selectedData.fullName.split("/")[0] : ''
        });
      }
    },
    getParentId() {
      if (this.deptFilter) {
        getOrganizeList().then(res => {
          const rList = res.data.list[0].children.filter(v => v.fullName === this.deptFilter);
          if (rList.length > 0) {
            this.parentId = rList[0].id;
          } else {
            this.parentId = this.deptFilter;
          }
        });
      } else {
        this.parentId = this.userInfo.companyId;
      }
    }
  }
}
</script>
