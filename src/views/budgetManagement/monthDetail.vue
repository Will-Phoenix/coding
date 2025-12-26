<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div class="top-container">
            <div class="top-name">{{ name }}详情</div>
            <div class="row-flex">
              <div class="row-flex">
                <div class="amount-container"><div>总预算金额</div><div class="amount">{{ formatAmount(stats.totalAmount) }}</div></div>
                <div class="amount-container"><div>总剩余金额</div><div class="amount">{{ formatAmount(stats.residueAmount) }}</div></div>
              </div>
              <!--              <el-form class="form">
                <el-form-item label="总预算大数据权限">
                  <el-select v-model="permission" clearable placeholder="请选择">
                    <el-option label="普通领导" :value="1" />
                    <el-option label="中层领导" :value="2" />
                    <el-option label="高层领导" :value="3" />
                  </el-select>
                </el-form-item>
              </el-form>-->
            </div>
            <div class="btn-container">
              <el-checkbox v-model="checked">万元展示</el-checkbox>
            </div>
          </div>
        </div>
        <vxe-table
          resizable
          style="margin: 0 10px"
          border
          size="small"
          ref="xTable"
          :data="tableData"
          :loading="listLoading"
        >
          <vxe-column filed="month" title="月份" width="80">
            <template #default="{row}">
              <span>{{ row.month }}月</span>
            </template>
          </vxe-column>
          <vxe-column field="curStatus" title="当前状态" min-width="160">
            <template slot-scope="scope">
              <div v-if="scope.row.curStatus * 1 === 3">已结束</div>
              <div v-else-if="scope.row.curStatus * 1 === 2" class="status-green">进行中</div>
              <div v-else class="status-red">未开始</div>
            </template>
          </vxe-column>
          <vxe-column field="totalAmount" title="总计金额" min-width="160">
            <template #default="{row}">
              <span>{{ formatAmount(row.totalAmount) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="residueAmount" title="当前剩余" min-width="120">
            <template #default="{row}">
              <span>{{ formatAmount(row.residueAmount) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="residuePercent" title="剩余百分比" min-width="160" />
          <vxe-column field="action" title="操作" width="120" fixed="right">
            <template #default="{row}">
              <el-button type="text" @click="onEditSubject(row)">编辑</el-button>
              <el-button type="text" @click="onDetail(row)">详情</el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <edit-month-budget
      :visible.sync="editData.visible"
      :data="editData.data"
      :loading="editData.loading"
      @confirm="onConfirm"
    />
  </div>
</template>
<script>
import EditMonthBudget from "@/views/budgetManagement/components/editMonthBudget.vue";
import { getBudgetMonthDetail, getBudgetMonthStats } from "@/api/business/budgetManagement";

export default {
  components: { EditMonthBudget },
  data() {
    return {
      id: this.$route.query.id,
      name: this.$route.query.name,
      permission: '',
      listLoading: false,
      tableData: [],
      stats: {
        totalAmount: 0,
        residueAmount: 0,
      },
      editData: {
        visible: false,
        data: {},
        loading: false,
      },
      checked: false,
    }
  },
  mounted() {
    this.loadList();
    this.loadStats();
  },
  methods: {
    onEditSubject(row) {
      this.editData.visible = true
      this.editData.data = { ...row }
    },
    onConfirm() {
      this.loadList();
      this.loadStats();
    },
    formatAmount(val) {
      if (!this.checked) {
        return val
      }
      return val / 10000 + '万元'
    },
    onDetail(row) {
      this.$router.push({
        path: "/budgetDetail",
        query: {
          id: row.id,
          name: this.name + row.month + '月份'
        }
      });
    },
    loadList() {
      this.listLoading = true
      getBudgetMonthDetail({ id: this.id }).then(res => {
        this.tableData = res.data
      }).finally(() => {
        this.listLoading = false
      });
    },
    loadStats() {
      getBudgetMonthStats({ id: this.id }).then(res => {
        if (res.data) {
          this.stats.totalAmount = res.data.totalAmount;
          this.stats.residueAmount = res.data.residueAmount;
        }
      });
    }
  }
}
</script>
<style scoped lang="scss">
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
.top-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  .top-name {
    font-size: 24px;
    font-weight: 500;
  }
  .row-flex {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .amount-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 60px;
      .amount {
        margin-top: 10px;
      }
    }
    .form {
      width: 350px;
    }
  }
}
.status-red {
  color: red;
}
.status-green {
  color: green;
}
</style>
