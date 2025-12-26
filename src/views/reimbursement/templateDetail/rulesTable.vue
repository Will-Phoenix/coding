<template>
  <div>
    <div style="margin-bottom: 10px;">已关联规则数据：{{ multipleSelection.length }}</div>
    <JNPF-table
      ref="tableRef"
      v-loading="listLoading"
      :data="list"
      :has-c="showSelect"
      @selection-change="handleSelectionChange"
      style="height: 450px"
    >
      <el-table-column
        prop="type"
        label="校验类型"
        align="left"
      />
      <el-table-column
        label="校验内容"
        prop="name"
        algin="left"
      />
      <el-table-column
        label="校验逻辑"
        prop="description"
        algin="left"
      />
      <el-table-column
        label="校验失败是否允许提交"
        prop="failType"
        algin="left"
      >
        <template slot-scope="{ row }">
          <el-select v-if="showSelect" v-model="row.failType" placeholder="请选择">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
          <div v-else>{{ row.failType === 1? "是" : "否" }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="异常提示"
        prop="failCause"
        algin="left"
      />
    </JNPF-table>
  </div>
</template>
<script>
import { getCcdSmartAuditRuleList, getCcdSmartAuditRuleListByIds } from "@/api/business/businessApproval";

export default {
  props: {
    // 是否显示select，并且决定列表展示的数据，
    // 显示：展示全部列表数据；不显示：展示当前模版的数据
    showSelect: {
      type: Boolean,
      default: false
    },
    // 已关联的规则ids，当showSelect为fasle，用来查询对应id的规则
    // 当当showSelect为true，用来把这些ids展示为已勾选的
    ruleIds: {
      type: String,
      default: ""
    },
    // 新增ruleIdsList，只要新编辑的都用ruleIdsList，没有该字段都用ruleIds，算是兼容旧数据都展示
    ruleIdsList: {
      type: Array,
      default: []
    },
  },
  data() {
    return {
      list: [],
      multipleSelection: [],
      listLoading: false,
    }
  },
  watch: {
    ruleIdsList: {
      async handler() {
        // ruleIds有值的话，在this.list中找到，并勾选
        await this.initData();
        this.initSelection();
      },
      // immediate: true,
    },
  },
  computed: {
    requestData() {
      return this.ruleIdsList.length > 0 ? this.ruleIdsList.map(v => v.ruleId).join(",") : this.ruleIds;
    }
  },
  async created() {
    await this.initData();
    this.initSelection();
  },
  methods: {
    async initData() {
      this.listLoading = true;
      const method = this.showSelect ? getCcdSmartAuditRuleList : getCcdSmartAuditRuleListByIds;
      const requestData = this.showSelect ? null : this.requestData;
      if ((!this.showSelect && requestData) || this.showSelect) {
        await method(requestData).then(res => {
          // 如果有ruleIdsList，则说明failType有模版自己的数据，则需要覆盖
          this.ruleIdsList.forEach(v => {
            res.data[res.data.findIndex(v2 => v2.id === v.ruleId)].failType = v.failType;
          });
          this.list = res.data;
          this.listLoading = false;
        });
      } else {
        this.list = [];
        this.listLoading = false;
      }
    },
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
      this.$emit("getSelect", this.multipleSelection);
    },
    initSelection() {
      this.multipleSelection = [];
      this.list.forEach(v => {
        if (this.requestData && this.requestData.split(",").includes(v.id.toString())) {
          this.multipleSelection.push(v);
          this.$refs.tableRef.toggleRowSelection(v, true);
        }
      });
      this.$emit("getSelect", this.multipleSelection);
    },
  }
}
</script>
<style lang="scss" scoped></style>
