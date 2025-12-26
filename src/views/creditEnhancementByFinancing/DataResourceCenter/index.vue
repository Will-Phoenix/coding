<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="top">
          <el-tabs v-model="activeName" type="card" @tab-click="handleClick" class="tab">
            <el-tab-pane label="市级平台数据" name="first"></el-tab-pane>
            <el-tab-pane label="省级平台数据" name="second"></el-tab-pane>
            <el-tab-pane label="国家级平台数据" name="third"></el-tab-pane>
          </el-tabs>
          <div class="mg-l1 item">
            <div class="title">平台总数据来源</div>
            <div class="content">3个</div>
          </div>
          <div class="mg-l2 item mg-r">
            <div class="title">平台总数据条数</div>
            <div class="content">134条</div>
          </div>
        </div>
        <div style="display: flex">
          <JNPF-table
            :data="list"
            :span-method="arraySpanMethod"
            border
            style="margin: 0 12px 0 20px"
          >
            <el-table-column
              label="数据来源"
              prop="source"
              algin="left"
            />
            <el-table-column
              label="数据名称"
              prop="name"
              algin="left"
            />
            <el-table-column
              label="数据量（条）"
              prop="number"
              algin="center"
            >
              <!--              <template slot-scope="scope">-->
              <!--                <div v-if="scope.row.budgetType * 1 === 1">普通预算</div>-->
              <!--                <div v-else>月度预算</div>-->
              <!--              </template>-->
            </el-table-column>
            <el-table-column
              label="获取方式"
              prop="getWay"
              algin="center"
            />
          </jnpf-table>
          <JNPF-table
            :data="list2"
            :span-method="arraySpanMethod2"
            border
            style="margin-right: 20px"
          >
            <el-table-column
              label="数据来源"
              prop="source"
              algin="left"
            />
            <el-table-column
              label="数据名称"
              prop="name"
              algin="left"
            />
            <el-table-column
              label="数据量（条）"
              prop="number"
              algin="center"
            >
              <!--              <template slot-scope="scope">-->
              <!--                <div v-if="scope.row.budgetType * 1 === 1">普通预算</div>-->
              <!--                <div v-else>月度预算</div>-->
              <!--              </template>-->
            </el-table-column>
            <el-table-column
              label="获取方式"
              prop="getWay"
              algin="center"
            />
          </jnpf-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { leftList, rightList } from "./data";

export default {
  data() {
    return {
      list: [],
      list2: [],
      activeName: "first"
    }
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.list = leftList();
      this.list2 = rightList();
    },
    resetData() {
      this.list = [];
      this.list2 = [];
    },
    handleClick(tab) {
      if (tab.name === "first") {
        this.initData();
      } else {
        this.resetData();
      }
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1) {
        const num = this.list.filter(v => v.source === row.source).length;
        const isFirst = this.list.findIndex(v => v.source === row.source) === rowIndex;
        if (num > 1) {
          if (isFirst) {
            return [num, 1];
          } else {
            return [0, 0];
          }
        }
      }
    },
    arraySpanMethod2({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1) {
        const num = this.list2.filter(v => v.source === row.source).length;
        const isFirst = this.list2.findIndex(v => v.source === row.source) === rowIndex;
        if (num > 1) {
          if (isFirst) {
            return [num, 1];
          } else {
            return [0, 0];
          }
        }
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
}
.plain {
  font-weight: bold;
  font-size: 12px;
  color: #00B4C4;
  background: #EBFDFF;
  margin-right: auto;
}
.top {
  display: flex;
  align-items: center;
}
.tab {
  margin-top: 20px;
  margin-left: 20px;
}
.mg-l1 {
  margin-left: auto;
}
.mg-l2 {
  margin-left: 35px;
}
.mg-r {
  margin-right: 20px;
}
.item {
  display: flex;
  align-items: center;
  .title {
    color: #5C5F66;
    line-height: 14px;
    margin-right: 8px;
  }
  .content {
    font-weight: bold;
    font-size: 16px;
    color: #00B4C4;
    line-height: 22px;
  }
}
.container-1 {
  height: calc(100% - 120px);
}
::v-deep .el-table--border th.el-table__cell {
  background: #F5FBFB;
}
</style>
